const express = require("express");

const app = express();

const cookieParser=require("cookie-parser");
const path=require("path");
const Port=process.env.Port;

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.resolve("../public")));
app.use(express.static(path.join(__dirname,"../public/images")));
app.use(cookieParser());

const UserRouter = require("./routes/user.route.js");

app.use("/api/v1/users",UserRouter);

module.exports=app;