import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import requireOrgAdmin from "../middlewares/orgAdmin.middleware.js";
import {
  approveEmployee,
  listPendingEmployees,
} from "../controllers/orgAdmin.controller.js";

/**
 * @fileoverview Organization Admin Routes
 * @description Defines endpoints for organization admins to manage employee approvals.
 * ORG_ADMIN role manages employee registrations within their organization.
 * @module routes/orgAdmin.routes
 */

const router = express.Router();

/**
 * @api {get} /api/org-admin/pending-users List Pending Employees
 * @apiDescription Get all employees awaiting approval in organization
 * @apiPermission org-admin
 * @apiHeader {String} Authorization Bearer JWT token
 * @apiNote Requires ORG_ADMIN role
 */
router.get(
  "/pending-users",
  requireAuth,
  requireOrgAdmin,
  listPendingEmployees
);

/**
 * @api {post} /api/org-admin/approve-user Approve Employee
 * @apiDescription Approve pending employee registration
 * @apiPermission org-admin
 * @apiHeader {String} Authorization Bearer JWT token
 * @apiBody {String} userId MongoDB ObjectId of employee to approve
 * @apiNote Requires ORG_ADMIN role, cross-org access prevented
 */
router.post(
  "/approve-user",
  requireAuth,
  requireOrgAdmin,
  approveEmployee
);

export default router;