import express from "express";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Test admin only router
router.get("/dashboard", 
            protect,
            authorize("ORG_ADMIN", "PLATFORM_ADMIN"),
            (req, res) => {
                res.json({
                    message : "Welcome Admin",
                    user : req.user.email,
                    role : req.user.role,
                });
            });

export default router;