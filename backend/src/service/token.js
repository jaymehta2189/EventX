require("dotenv").config();
const jwt=require("jsonwebtoken");

const secretKey=process.env.SECRET_KEY;

exports.createTokenForUser= (user)=>{
    return   jwt.sign({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        avatar:user.avatar,
        accessToken:user.accessToken,
        refreshToken:user.refreshToken,
    }
    ,secretKey);
}
exports.verifyToken= (token)=>{
    return  jwt.verify(token,secretKey);
}