const User=require("../models/user.model.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

exports.signupPost=async (req,res)=>{

    const {name,email,password}=req.body;
    console.log(name);
    const user=await User.create({
        name,
        email,
        password
    });

    console.log("user Created");

    return res.status(201).json(new ApiResponse(201,"User Created"));
    
}

exports.signinPost=async (req,res)=>{
    const {email,password}=req.body;
    try{   
        const token=await User.matchPasswordAndGenerateToken(email,password);
        
        return res.cookie("token",token).redirect("/");
    }catch(error){

       return res.status(400).json(new ApiError(400,error.message));
    }
}
exports.logout=(req,res)=>{
    res.clearCookie("token").redirect("/");
 }