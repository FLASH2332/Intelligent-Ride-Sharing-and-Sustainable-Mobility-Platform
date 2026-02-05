import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import isStrongPassword from "../utils/passwordValidator.js";
import { generateToken } from "../services/token.service.js";

export const registerEmployee = async (req, res) => {
  try {
    const { email, phone, password, orgCode } = req.body;

    // 1️⃣ Basic validation
    if (!email || !phone || !password || !orgCode) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2️⃣ Password strength check
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    // 3️⃣ Check if organization exists & is active
    const organization = await Organization.findOne({
      orgCode: orgCode.toUpperCase(),
      isActive: true,
    });

    if (!organization) {
      return res.status(400).json({
        message: "Invalid or inactive organization code",
      });
    }

    // 4️⃣ Check for existing user
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

    // 6️⃣ Create user (EMPLOYEE ONLY)
    await User.create({
      email,
      phone,
      passwordHash,
      organizationId: organization._id,
      role: "EMPLOYEE",
      approvalStatus: "PENDING",
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    // 7️⃣ Success response
    return res.status(201).json({
      message:
        "Registration successful. Awaiting organization admin approval.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      if (user.approvalStatus !== "APPROVED") {
        return res.status(403).json({
          message:
            "Your account is awaiting organization admin approval. Please contact your administrator.",
          approvalStatus: user.approvalStatus,
        });
      }
      
  
      const token = generateToken({
        userId: user._id,
        role: user.role,
        organizationId: user.organizationId || null,
      });
  
      res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  };