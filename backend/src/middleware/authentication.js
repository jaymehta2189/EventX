const { verifyToken } = require("../service/token");
function checkForAuth(req, res, next) {
    const cookieName = "token";
    const cookietoken = req.cookies[cookieName] || req.header("Authorization")?.replace("Bearer ","");

    if (!cookietoken) {
        return res.status(401).json({
            msg: "Unauthorization request"
        });
    }
    
    const decodedValue = verifyToken(cookietoken);

    if (decodedValue) {
        req.user = decodedValue;
        next();
    } else {
        return res.status(403).json({
            msg: "You are not authenticated"
        });
    }
}

module.exports = checkForAuth;
