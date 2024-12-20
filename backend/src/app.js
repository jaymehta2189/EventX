const express = require("express");

const app = express();

const cookieParser=require("cookie-parser");
const path=require("path");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.resolve("../public")));
app.use(express.static(path.join(__dirname,"../public/images")));
app.use(cookieParser());

const UserRouter = require("./routes/user.route.js");

app.use("/api/v1/users",UserRouter);
app.use((err,req,res,next)=>{
    if(err){
        return res.status(err.statusCode).json({
            success:err.success,
            message:err.message,
            errors:err.errors
        });
    }
})
module.exports=app;