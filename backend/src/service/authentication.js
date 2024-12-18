require("dotenv").config();

const jwt=require("jsonwebtoken");
const secretKey=process.env.secretkey;

exports.createTokenForUser=(user)=>{
    const payload={
        _id:user._id,
        email:user.email,
        avatar:user.avatar,
    };
    console.log(secretKey);
    const token=jwt.sign(payload,secretKey);
    return token;
}


exports.verifyToken=(token)=>{
    const payload=jwt.verify(token,secretKey);
    return payload;
}