const express = require("express");

const app = express();

const cookieParser=require("cookie-parser");
const path=require("path");
const ApiError = require("./utils/ApiError.js");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.resolve("../public")));
app.use(express.static(path.join(__dirname,"../public/images")));
app.use(cookieParser());

const UserRouter = require("./routes/user.route.js");
const EventRouter = require("./routes/event.route.js");
const GroupRouter = require("./routes/group.route.js");
const UserGroupJoinRouter = require("./routes/user_group_join.route.js");
// const OrgRouter = require("./routes/org.route.js");
// const au= require("./middleware/authentication.js");

// // app.use(checkForAuth("token"));
// console.log("checkForAuth:", typeof au.checkForAuth);  // Should log 'function'

// app.use(au.checkForAuth("token"));
app.use("/api/v1/users",UserRouter);
app.use("/api/v1/events",EventRouter);
app.use("/api/v1/groups",GroupRouter);
app.use("/api/v1/userjoin",UserGroupJoinRouter);
// app.use("/api/v1/orgs",OrgRouter);


app.use((err,req,res,next)=>{
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
            data: err.data,
        });
    } else {
        return res.status(500).json({ message: "Internal Server Error" , info : err.message});
    }
});

module.exports=app;