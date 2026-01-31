import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    // --------------------
    // Core Identity
    // --------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Used ONLY during employee signup
    orgCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    // Org admins are Users with role = ORG_ADMIN
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Used to disable org-wide access
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default mongoose.model("Organization", organizationSchema);