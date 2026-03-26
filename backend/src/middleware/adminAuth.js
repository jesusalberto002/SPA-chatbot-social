
exports.adminAuthenticator = (req, res, next) => {

    if (req.user && req.user.role === "ADMIN"){
        next();
    }
    else{
        res.status(403).json({message: "Forbidden acess: Acess is restricted to administrators."})
    }
};