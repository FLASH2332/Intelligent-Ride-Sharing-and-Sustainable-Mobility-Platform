import express from "express";
import { registerEmployee, loginUser } from "../controllers/authController.js";

const router = express.Router();

// EMPLOYEE signup only
router.post("/register", registerEmployee);
router.post("/login", loginUser);

export default router;