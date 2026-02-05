import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import requireOrgAdmin from "../middlewares/orgAdmin.middleware.js";
import {
  approveEmployee,
  listPendingEmployees,
} from "../controllers/orgAdmin.controller.js";

const router = express.Router();

/**
 * GET pending employees in org
 */
router.get(
  "/pending-users",
  requireAuth,
  requireOrgAdmin,
  listPendingEmployees
);

/**
 * POST approve employee
 */
router.post(
  "/approve-user",
  requireAuth,
  requireOrgAdmin,
  approveEmployee
);

export default router;