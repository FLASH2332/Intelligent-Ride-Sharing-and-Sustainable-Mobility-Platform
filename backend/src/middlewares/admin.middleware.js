/**
 * Middleware to allow ONLY Org Admin or Platform Admin
 */
const requireAdmin = (req, res, next) => {
    try {
      const { role } = req.user;
  
      if (role !== "ORG_ADMIN" && role !== "PLATFORM_ADMIN") {
        return res.status(403).json({
          message: "Admin access required",
        });
      }
  
      next();
    } catch (err) {
      return res.status(401).json({
        err

      });
    }
  };
  
  export default requireAdmin;
  