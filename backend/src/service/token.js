require("dotenv").config();
const jwt=require("jsonwebtoken");
<<<<<<< HEAD
const { applyVirtuals } = require("../models/otp.model");
const { access } = require("fs");
=======
>>>>>>> main

const secretKey=process.env.SECRET_KEY;

exports.createTokenForUser= (user)=>{
    return   jwt.sign({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        avatar:user.avatar,
<<<<<<< HEAD
        accessToken:user.accessToken
=======
        accessToken:user.accessToken,
        refreshToken:user.refreshToken,
>>>>>>> main
    }
    ,secretKey);
}
exports.verifyToken= (token)=>{
    return  jwt.verify(token,secretKey);
}