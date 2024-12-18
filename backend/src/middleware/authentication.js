require("dotenv").config();

const jwt=require("jsonwebtoken");
const { verifyToken } = require("../service/authentication");

exports. checkForAuth=(cookieName)=>{
    return (req,res,next)=>{
        const cookietoken=req.cookies[cookieName];
        if(!cookietoken){
             return next();//important
        }
        try{
            const payload=verifyToken(cookietoken);
            req.user=payload;

        }catch(error){}
       return  next();
    }
}
