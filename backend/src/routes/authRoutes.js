import express from "express";
import { registerEmployee, loginUser, resetPassword, forgotPassword } from "../controllers/authController.js";

/**
 * @fileoverview Authentication Routes
 * @description Defines public authentication endpoints for user registration, login,
 * and password reset functionality.
 * @module routes/authRoutes
 */

const router = express.Router();

/**
 * @api {post} /api/auth/register Register Employee
 * @apiDescription Register a new employee account within an organization
 * @apiPermission public
 * @apiBody {String} email Employee email address
 * @apiBody {String} phone Employee phone number
 * @apiBody {String} password Account password (strong password required)
 * @apiBody {String} orgCode Organization code
 */
router.post("/register", registerEmployee);

/**
 * @api {post} /api/auth/login User Login
 * @apiDescription Authenticate user and receive JWT token
 * @apiPermission public
 * @apiBody {String} email User email address
 * @apiBody {String} password Account password
 */
router.post("/login", loginUser);

/**
 * @api {post} /api/auth/forgot-password Forgot Password
 * @apiDescription Request password reset email with secure token
 * @apiPermission public
 * @apiBody {String} email User email address
 */
router.post("/forgot-password", forgotPassword);

/**
 * @api {post} /api/auth/reset-password/:token Reset Password
 * @apiDescription Reset password using token from email
 * @apiPermission public
 * @apiParam {String} token Password reset token from email
 * @apiBody {String} password New password (strong password required)
 */
router.post("/reset-password/:token", resetPassword);

export default router;