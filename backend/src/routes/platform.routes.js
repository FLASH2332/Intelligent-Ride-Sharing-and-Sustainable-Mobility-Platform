import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import requirePlatformAdmin from "../middlewares/platform.middleware.js";
import {
  createOrganization,
  createOrgAdmin,
} from "../controllers/platform.controller.js";

const router = express.Router();

router.post(
  "/organizations",
  requireAuth,
  requirePlatformAdmin,
  createOrganization
);

router.post(
  "/org-admins",
  requireAuth,
  requirePlatformAdmin,
  createOrgAdmin
);

export default router;