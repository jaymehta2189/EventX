require("dotenv").config();
const jwt=require("jsonwebtoken");

const secretKey=process.env.SecretKey;

exports.createTokenForUser=(user)=>{
    return jwt.sign({
        _id:user._id,
        email:user.email,
        avatar:user.avatar,
    }
    ,secretKey);
}
exports.verifyToken=(token)=>{
    return jwt.verify(token,secretKey);
}