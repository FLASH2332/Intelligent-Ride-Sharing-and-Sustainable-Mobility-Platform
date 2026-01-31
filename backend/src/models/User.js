import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --------------------
    // Identity (Login)
    // --------------------
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    // --------------------
    // Verification State
    // --------------------
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // --------------------
    // Role & Organization
    // --------------------
    role: {
      type: String,
      enum: ["EMPLOYEE", "ORG_ADMIN", "PLATFORM_ADMIN"],
      default: "EMPLOYEE",
    },

    // Every user belongs to exactly ONE org
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      immutable: true,
    },

    // Org admin approval for employees
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    // --------------------
    // Profile Information
    // --------------------
    name: {
      type: String,
      trim: true,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // --------------------
    // Driver Capability
    // --------------------
    isDriver: {
      type: Boolean,
      default: false,
    },

    driverStatus: {
      type: String,
      enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
      default: "NONE",
    },

    documentsUploaded: {
      type: Boolean,
      default: false,
    },

    // --------------------
    // System Metadata
    // --------------------
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default mongoose.model("User", userSchema);