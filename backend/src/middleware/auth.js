const { getValidAccessToken } = require('../routes/auth.route.js');
const ApiError = require('../utils/ApiError.js');
const {UserSuccess} = require('../utils/Constants/User.js')

function checkForCleander(req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            msg: "You are not authenticated"
        });
    }

    getValidAccessToken(req.user._id).then(tokens => {

        if (req.user.accessToken != tokens.accessToken) {
            req.user.accessToken = tokens.accessToken;
            res.cookie("token", tokens.token, { path: "/" });
        }

        next();

    }).catch(error => {
        if (error instanceof ApiError) {
            switch (error.code) {
                case 1005: // refresh token expiry
                    // log out and redirect to login page
                return res
                    .status(UserSuccess.LOG_OUT.statusCode)
                    .json(UserSuccess.LOG_OUT);
                    
                case 1006: // is not login with google account
                    return next();
            }
        }
        console.log(error.statusCode);
        return res.status(403).json({
            msg: "You are not authenticated"
        });
    });

};


module.exports = checkForCleander;
