const express = require("express");
require('dotenv').config();

const fileUpload = require('express-fileupload');
const app = express();
const cors = require('cors');
const passport = require('./utils/passportConfig');
const cookieParser=require("cookie-parser");
const path=require("path");
const session = require('express-session');
const ApiError = require("./utils/ApiError.js");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow cookies
}));

app.use(fileUpload());

const UserRouter = require("./routes/user.route.js");
const EventRouter = require("./routes/event.route.js");
const GroupRouter = require("./routes/group.route.js");
const UserGroupJoinRouter = require("./routes/user_group_join.route.js");
const AuthRouter = require('./routes/auth.route');


app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


app.use("/api/v1/users",UserRouter);
app.use("/api/v1/events",EventRouter);
app.use("/api/v1/groups",GroupRouter);
app.use("/api/v1/userjoin",UserGroupJoinRouter);
app.use('/api/v1/auth', AuthRouter);


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