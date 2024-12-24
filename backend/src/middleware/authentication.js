require("dotenv").config();
const { verifyToken } = require("../service/authentication");

exports.checkForAuth=(cookieName)=>{
    return (req,res,next)=>{
        const cookietoken = req.cookies[cookieName] || req.header("Authorization")?.replace("Bearer ","");
        if(!cookietoken){
            throw new ApiError(401,"Unauthorization request");
            // return next();//important
        }
        try{
            const payload=verifyToken(cookietoken);
            req.person=payload;
        }catch(error){
            throw new ApiError(401,error?.massage || "Invalied Access Token");
        }
       return  next();
    }
}
