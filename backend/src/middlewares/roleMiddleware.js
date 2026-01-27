
// Rest Parameter - collects multiple roles into an array
// authorize("admin", "org") ==> allowedRoles = ["admin", "org"]
const authorize = (...allowedRoles) => {

    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({message : "Not Authenticated"});
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message : "Access denied, insufficient permissions",
            });
        }

        next();

    };

};

export default authorize;