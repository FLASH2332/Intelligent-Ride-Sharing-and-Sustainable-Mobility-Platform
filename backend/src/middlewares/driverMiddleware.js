const requireDriver = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
  
    if (!req.user.isDriver) {
      return res.status(403).json({
        message: "Access denied: user is not registered as a driver",
      });
    }
  
    next();
  };
  
  export default requireDriver;
  