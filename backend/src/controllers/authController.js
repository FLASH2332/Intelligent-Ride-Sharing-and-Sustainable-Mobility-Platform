import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import isStrongPassword from "../utils/passwordValidator.js";
import { generateToken } from "../services/token.service.js";
import { sendEmail } from "../services/email.service.js";

/* ======================================================
   REGISTER EMPLOYEE
====================================================== */
export const registerEmployee = async (req, res) => {
  try {
    const { email, phone, password, orgCode } = req.body;

    // 1️⃣ Basic validation
    if (!email || !phone || !password || !orgCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    // 3️⃣ Validate organization
    const organization = await Organization.findOne({
      orgCode: orgCode.toUpperCase(),
      isActive: true,
    });

    if (!organization) {
      return res
        .status(400)
        .json({ message: "Invalid or inactive organization code" });
    }

    // 4️⃣ Existing user check
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email or phone already exists",
      });
    }

    // 5️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 6️⃣ Create employee
    await User.create({
      email,
      phone,
      passwordHash,
      organizationId: organization._id,
      role: "EMPLOYEE",
      approvalStatus: "PENDING",
      isEmailVerified: false,
      isPhoneVerified: false,
      profileCompleted: false,
    });

    return res.status(201).json({
      message:
        "Registration successful. Awaiting organization admin approval.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   LOGIN USER
====================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ⛔ Approval gate
    if (user.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        message:
          "Your account is awaiting organization admin approval. Please contact your administrator.",
        approvalStatus: user.approvalStatus,
      });
    }

    // ✅ Generate token
    const token = generateToken({
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId || null,
      isDriver: user.isDriver || false,
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
        profileCompleted: user.profileCompleted,
        isDriver: user.isDriver || false,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ======================================================
   FORGOT PASSWORD
====================================================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // ⚠️ Do not reveal user existence
    if (!user) {
      return res.json({
        message:
          "If this email exists, a password reset link has been generated.",
      });
    }

    // 1️⃣ Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ Hash before storing
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // 3️⃣ Build reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 4️⃣ Send email
    await sendEmail({
      to: user.email,
      subject: "Reset your GreenCommute password",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset for your GreenCommute account.</p>
        <p>
          <a href="${resetLink}" style="
            padding:10px 16px;
            background:#059669;
            color:#ffffff;
            border-radius:6px;
            text-decoration:none;
            display:inline-block;
          ">
            Reset Password
          </a>
        </p>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      `,
    });

    return res.json({
      message:
        "If this email exists, a password reset link has been generated.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Failed to process request" });
  }
};

/* ======================================================
   RESET PASSWORD
====================================================== */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Password reset failed" });
  }
};
