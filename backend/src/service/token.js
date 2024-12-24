require("dotenv").config();
const jwt=require("jsonwebtoken");

const secretKey=process.env.SECRET_KEY;

exports.createTokenForUser= (user)=>{
    return  jwt.sign({
        _id:user._id,
        email:user.email,
        role:user.role
    }
    ,secretKey);
}
exports.verifyToken= (token)=>{
    return  jwt.verify(token,secretKey);
}