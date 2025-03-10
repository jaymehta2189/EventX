const User = require('../models/user.model');
function checkForUser (req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            msg: "You are not authenticated"
        });
    }
    if(req.user.role !== User.allowedRoles[0]){
        return res.status(403).json({
            msg: "You are not authorized"
        });
    }
    next();
};

function checkForOrg (req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            msg: "You are not authenticated"
        });
    }
    console.log(User.allowedRoles[1]);
    if(req.user.role !== User.allowedRoles[1]){
        
        return res.status(403).json({
            msg: "You are not authorized"
        });
    }
    next();
};

function checkForStaff (req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            msg: "You are not authenticated"
        });
    }
    if(req.user.role !== "staff"){
        return res.status(403).json({
            msg: "You are not authorized"
        });
    }
    next();
};

function checkForAdmin (req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            msg: "You are not authenticated"
        });
    }
    if(req.user.role !== "admin"){
        return res.status(403).json({
            msg: "You are not authorized"
        });
    }
    next();
};

module.exports = { checkForUser, checkForOrg, 
     checkForStaff , checkForAdmin 
};