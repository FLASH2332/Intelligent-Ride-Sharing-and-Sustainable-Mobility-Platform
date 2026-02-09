import User from "../models/User.js";

/**
 * GET /api/users/me
 * Fetch logged-in user's profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-passwordHash -passwordResetToken -passwordResetExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * POST /api/users/complete-profile
 * Complete profile (FIRST TIME ONLY)
 */
export const completeProfile = async (req, res) => {
  try {
    const {
      name,
      dob,
      gender,
      homeAddress,
      workAddress,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    // Required fields (emergency contact optional)
    if (!name || !dob || !gender || !homeAddress || !workAddress) {
      return res.status(400).json({
        message: "Please fill all required profile fields",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profileCompleted) {
      return res.status(400).json({
        message: "Profile already completed",
      });
    }

    user.name = name;
    user.dob = dob;
    user.gender = gender;
    user.homeAddress = homeAddress;
    user.workAddress = workAddress;

    // Emergency contact (optional)
    if (emergencyContactName || emergencyContactPhone) {
      user.emergencyContact = {
        name: emergencyContactName || "",
        phone: emergencyContactPhone || "",
      };
    }

    user.profileCompleted = true;
    await user.save();

    res.json({
      message: "Profile completed successfully",
    });
  } catch (err) {
    console.error("Complete profile error:", err);
    res.status(500).json({ message: "Profile completion failed" });
  }
};

/**
 * POST /api/users/driver-intent
 * User opts in to become a driver
 */
export const requestDriverAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.profileCompleted) {
      return res.status(400).json({
        message: "Complete profile before requesting driver access",
      });
    }

    if (user.isDriver || user.driverStatus === "PENDING") {
      return res.status(400).json({
        message: "Driver request already submitted",
      });
    }

    // Don't set isDriver true until admin approves
    user.driverStatus = "PENDING";
    user.documentsUploaded = false;

    await user.save();

    res.json({
      message: "Driver request submitted",
      driverStatus: user.driverStatus,
    });
  } catch (err) {
    console.error("Driver request error:", err);
    res.status(500).json({ message: "Failed to request driver access" });
  }
};
