const User=require("../models/user.model.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
exports.signupPost=asyncHandler(async (req,res)=>{
    

        const {name,email,password}=req.body;
        if(!name||!email||!password){
            throw new ApiError(400,"Please provide all the details");
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, "User already exists with this email.");
        }

        console.log(name);
        const user=await User.create({
            name,
            email,
            password
        });
        if(!user){
            throw new ApiError(400,"Invalid User Data");
        }
        console.log(user);
    
        console.log("user Created");
        
        return res.status(201).json(new ApiResponse(201, {Name:name,Email:email,avatar:avatar}= user,"User Created"));
    }    
);

exports.signinPost=asyncHandler(async (req,res)=>{
    const {email,password}=req.body;
    try{   
        const token=await User.matchPasswordAndGenerateToken(email,password);
        
        return res.status(200).cookie("token",token).json(new ApiResponse(200,{token},"User Logged In"));
    }catch(error){

       throw new ApiError(400,error.message);
    }
});
exports.logout=asyncHandler((req,res)=>{
    return res.status(200).clearCookie("token").json(new ApiResponse(200,{},"User Logged Out"));
 });