const User=require("../models/user.model");

exports.signupPost=async (req,res)=>{

    const {name,email,password}=req.body;
    console.log(name);
    const user=await User.create({
        name,
        email,
        password
    });
    console.log("user Created")
    res.send("created")
}
exports.signinPost=async (req,res)=>{
    const {email,password}=req.body;
    try{   
        const token=await User.matchPasswordAndGenerateToken(email,password);
        
        return res.cookie("token",token).redirect("/");
    }catch(error){
       return res.render("signin",{
           error:"Incorrect Email or Password"
       })
    }
}
exports.logout=(req,res)=>{
    res.clearCookie("token").redirect("/")
 }