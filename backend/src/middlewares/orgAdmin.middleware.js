const requireOrgAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    if (req.user.role !== "ORG_ADMIN") {
      return res.status(403).json({
        message: "Org admin access required",
      });
    }
  
    next();
  };
  
  export default requireOrgAdmin;