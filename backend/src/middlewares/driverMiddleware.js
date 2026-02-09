// Middleware to check if user is a driver
const requireDriver = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check if user has driver privileges
    if (!req.user.isDriver) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Driver privileges required."
      });
    }

    next();
  } catch (error) {
    console.error("Driver middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in driver middleware"
    });
  }
};

export default requireDriver;
