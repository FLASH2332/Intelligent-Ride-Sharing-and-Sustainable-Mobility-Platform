const requirePlatformAdmin = (req, res, next) => {
    if (req.user.role !== "PLATFORM_ADMIN") {
      return res.status(403).json({ message: "Platform admin access required" });
    }
    next();
  };
  
  export default requirePlatformAdmin;