import User from "../models/User.js";

/**
 * GET /org-admin/driver-requests
 * Fetch pending driver requests for org admin
 */
export const getDriverRequests = async (req, res) => {
  try {
    if (req.user.role !== "ORG_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const drivers = await User.find({
      role: "EMPLOYEE",
      documentsUploaded: true,
      driverStatus: "PENDING",
      organizationId: req.user.organizationId,
    }).select("name email phone createdAt driverDocuments");

    res.json({ drivers });
  } catch (err) {
    console.error("Fetch driver requests error:", err);
    res.status(500).json({ message: "Failed to fetch driver requests" });
  }
};


/**
 * POST /org-admin/driver-requests/:id/approve
 */
export const approveDriver = async (req, res) => {
  try {
    if (req.user.role !== "ORG_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const driver = await User.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "User not found" });
    }

    driver.driverStatus = "APPROVED";
    driver.isDriver = true; // Set isDriver to true on approval
    await driver.save();

    res.json({ message: "Driver approved successfully" });
  } catch (err) {
    console.error("Approve driver error:", err);
    res.status(500).json({ message: "Approval failed" });
  }
};

/**
 * POST /org-admin/driver-requests/:id/reject
 */
export const rejectDriver = async (req, res) => {
  try {
    const { reason } = req.body;

    if (req.user.role !== "ORG_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const driver = await User.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "User not found" });
    }

    driver.driverStatus = "REJECTED";
    driver.driverRejectionReason = reason || "Not specified";
    driver.isDriver = false;

    await driver.save();

    res.json({ message: "Driver rejected" });
  } catch (err) {
    console.error("Reject driver error:", err);
    res.status(500).json({ message: "Rejection failed" });
  }
};

