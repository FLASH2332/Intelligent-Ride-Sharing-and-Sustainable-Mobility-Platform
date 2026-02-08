import express from "express";
import { registerEmployee, loginUser, resetPassword, forgotPassword } from "../controllers/authController.js";

const router = express.Router();

// EMPLOYEE signup only
router.post("/register", registerEmployee);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


export default router;