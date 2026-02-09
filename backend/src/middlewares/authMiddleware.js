// Epic-2 compatible auth middleware
// This is an alias to work with epic-2 routes that expect 'protect' function
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided. Authorization denied." 
      });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database and attach to request
    const user = await User.findById(decoded.userId).select("-passwordHash");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found. Authorization denied." 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};

export default protect;
