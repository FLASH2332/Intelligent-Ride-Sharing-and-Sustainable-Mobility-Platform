import Organization from "../models/Organization.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

/* CREATE ORGANIZATION */
export const createOrganization = async (req, res) => {
  try {
    const { name, orgCode } = req.body;

    if (!name || !orgCode) {
      return res.status(400).json({ message: "Name and orgCode required" });
    }

    const exists = await Organization.findOne({ orgCode });
    if (exists) {
      return res.status(409).json({ message: "Org code already exists" });
    }

    const org = await Organization.create({
      name,
      orgCode: orgCode.toUpperCase(),
      admins: [],
      isActive: true,
    });

    res.status(201).json(org);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create organization" });
  }
};

export const createOrgAdmin = async (req, res) => {
    try {
      const { email, phone, password, orgCode } = req.body;
  
      if (!email || !phone || !password || !orgCode) {
        return res.status(400).json({ message: "All fields required" });
      }
  
      // 🔑 Convert orgCode → Organization
      const org = await Organization.findOne({ orgCode: orgCode.toUpperCase() });
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
  
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
  
      const passwordHash = await bcrypt.hash(password, 12);
  
      const orgAdmin = await User.create({
        email,
        phone,
        passwordHash,
        role: "ORG_ADMIN",
        organizationId: org._id, // 👈 INTERNAL USE ONLY
        approvalStatus: "APPROVED",
        isEmailVerified: true,
        isPhoneVerified: true,
        profileCompleted: true,
      });
  
      org.admins.push(orgAdmin._id);
      await org.save();
  
      res.status(201).json({
        message: "Organization admin created",
        orgAdminId: orgAdmin._id,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to create org admin" });
    }
  };