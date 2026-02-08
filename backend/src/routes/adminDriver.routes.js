import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import {
  getDriverRequests,
  approveDriver,
  rejectDriver,
} from "../controllers/adminDriver.controller.js";

const router = express.Router();

router.get("/driver-requests", requireAuth, getDriverRequests);

router.post(
  "/driver-requests/:id/approve",
  requireAuth,
  approveDriver
);

router.post(
  "/driver-requests/:id/reject",
  requireAuth,
  rejectDriver
);

export default router;
