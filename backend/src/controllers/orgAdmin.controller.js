import User from "../models/User.js";

/**
 * LIST all pending employees in the org
 */
export const listPendingEmployees = async (req, res) => {
  try {
    const users = await User.find({
      organizationId: req.user.organizationId,
      role: "EMPLOYEE",
      approvalStatus: "PENDING",
    }).select("_id email phone createdAt");

    res.json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

/**
 * APPROVE employee
 */
export const approveEmployee = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cross-org protection
    if (
      user.organizationId.toString() !==
      req.user.organizationId.toString()
    ) {
      return res.status(403).json({ message: "Cross-org access denied" });
    }

    user.approvalStatus = "APPROVED";
    await user.save();

    res.json({ message: "Employee approved" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Approval failed" });
  }
};