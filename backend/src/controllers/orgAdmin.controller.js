import User from "../models/User.js";

/**
 * @fileoverview Organization Admin Employee Management Controller
 * @description Handles organization admin operations for managing employee approval status.
 * ORG_ADMIN role users manage employee registrations within their organization.
 * @module controllers/orgAdmin.controller
 */

/**
 * List Pending Employees
 * 
 * @description Retrieves all employees awaiting approval within the organization admin's
 * organization. Used to manage employee registration requests.
 * 
 * @route GET /api/org-admin/pending-employees
 * @access Private (ORG_ADMIN only)
 * 
 * @param {Object} req.user - Decoded JWT payload
 * @param {string} req.user.organizationId - MongoDB ObjectId of admin's organization
 * @param {string} req.user.role - Must be ORG_ADMIN
 * 
 * @returns {Object} 200 - List of pending employees
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Request
 * GET /api/org-admin/pending-employees
 * Authorization: Bearer <jwt_token>
 * 
 * // Response
 * {
 *   "users": [
 *     {
 *       "_id": "507f1f77bcf86cd799439011",
 *       "email": "employee@company.com",
 *       "phone": "+1234567890",
 *       "createdAt": "2026-02-12T10:30:00.000Z"
 *     },
 *     ...
 *   ]
 * }
 * 
 * @businessLogic
 * - Only ORG_ADMIN role can access
 * - Returns employees from same organization only
 * - Filters users with role=EMPLOYEE and approvalStatus=PENDING
 * - Limited fields returned: _id, email, phone, createdAt
 * - Admin reviews and approves/rejects via separate endpoints
 * - Cross-organization data isolation enforced
 * 
 * @security
 * - Organization boundary enforced by organizationId match
 * - Requires ORG_ADMIN role validated by middleware
 */
export const listPendingEmployees = async (req, res) => {
  try {
    const users = await User.find({
      organizationId: req.user.organizationId,
      role: "EMPLOYEE",
      approvalStatus: "PENDING",
    }).select("_id email phone createdAt");

    res.json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

/**
 * Approve Employee
 * 
 * @description Organization admin approves a pending employee registration, granting
 * access to the platform. Enforces cross-organization access protection.
 * 
 * @route POST /api/org-admin/approve-employee
 * @access Private (ORG_ADMIN only)
 * 
 * @param {Object} req.user - Decoded JWT payload
 * @param {string} req.user.organizationId - MongoDB ObjectId of admin's organization
 * @param {string} req.user.role - Must be ORG_ADMIN
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - MongoDB ObjectId of employee to approve
 * 
 * @returns {Object} 200 - Employee approved successfully
 * @returns {Object} 400 - Missing userId
 * @returns {Object} 403 - Cross-organization access denied
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Request
 * POST /api/org-admin/approve-employee
 * Authorization: Bearer <jwt_token>
 * {
 *   "userId": "507f1f77bcf86cd799439011"
 * }
 * 
 * // Response
 * {
 *   "message": "Employee approved"
 * }
 * 
 * @businessLogic
 * - Only ORG_ADMIN role can approve employees
 * - Validates userId is provided
 * - Fetches user and validates exists
 * - Cross-organization protection: verifies employee belongs to admin's organization
 * - Sets approvalStatus to APPROVED
 * - Employee can now login and access platform features
 * - Consider sending email notification (future enhancement)
 * 
 * @security
 * - Critical cross-organization boundary check
 * - Admin cannot approve employees from other organizations
 * - Prevents unauthorized access escalation
 */
export const approveEmployee = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cross-org protection
    if (
      user.organizationId.toString() !==
      req.user.organizationId.toString()
    ) {
      return res.status(403).json({ message: "Cross-org access denied" });
    }

    user.approvalStatus = "APPROVED";
    await user.save();

    res.json({ message: "Employee approved" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Approval failed" });
  }
};