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
    // Password Reset
    // --------------------
    passwordResetToken: String,
    passwordResetExpires: Date,

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

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: function () {
        return this.role !== "PLATFORM_ADMIN";
      },
    },

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

    dob: Date,

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
    },

    homeAddress: {
      type: String,
      trim: true,
    },

    workAddress: {
      type: String,
      trim: true,
    },

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
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



driverReviewedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User", // admin
},

driverReviewedAt: {
  type: Date,
},

driverDocuments: {
  license: { type: String },
  rc: { type: String },
},


driverRejectionReason: {
  type: String,
},



    // --------------------
    // System Metadata
    // --------------------
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
