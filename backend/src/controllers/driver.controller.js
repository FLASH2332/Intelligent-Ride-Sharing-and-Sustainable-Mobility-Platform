import User from "../models/User.js";

export const uploadDriverDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.isDriver) {
      return res.status(400).json({ message: "Invalid driver request" });
    }

    if (!req.files?.license || !req.files?.rc) {
      return res.status(400).json({
        message: "License and RC are required",
      });
    }

    user.driverDocuments = {
      license: req.files.license[0].path,
      rc: req.files.rc[0].path,
    };

    user.documentsUploaded = true;
    user.driverStatus = "PENDING";

    await user.save();

    res.json({
      message: "Documents uploaded successfully. Awaiting approval.",
    });
  } catch (err) {
    console.error("Upload docs error:", err);
    res.status(500).json({ message: "Document upload failed" });
  }
};

