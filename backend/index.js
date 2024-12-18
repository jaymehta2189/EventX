require("dotenv").config();
const express=require("express");
const cookieParser=require("cookie-parser");
const path=require("path");
const userroute=require("./src/routes/user.route")
const app=express();
app.use(express.json())
const Port=process.env.Port;
const mongoose=require("mongoose");
mongoose.connect(process.env.ConnectionUrl);

app.use(express.urlencoded({extended:false}));
app.use(express.static(path.resolve("./public")));
app.use(express.static(path.join(__dirname,"./public/images")))
app.use(cookieParser());

app.use("/user",userroute)
app.listen(Port,()=>{console.log("listening")})

module.exports=app;