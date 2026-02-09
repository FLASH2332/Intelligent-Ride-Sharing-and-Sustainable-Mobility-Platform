import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import {
  getMyProfile,
  completeProfile,
  requestDriverAccess,
} from "../controllers/user.controller.js";

const router = express.Router();

// Fetch logged-in user's profile
router.get("/me", requireAuth, getMyProfile);

// Complete profile (FIRST TIME ONLY)
router.put("/complete-profile", requireAuth, completeProfile);

router.post("/driver-intent", requireAuth, requestDriverAccess);

export default router;
