const express = require("express");

const fileUpload = require('express-fileupload');
const app = express();
const cors = require('cors');

const cookieParser = require("cookie-parser");
const path = require("path");
const ApiError = require("./utils/ApiError.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.resolve("../public")));
app.use(express.static(path.resolve(__dirname, '../public')));
// app.use(express.static(path.join(__dirname,"../public/images")));


app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.use(fileUpload());

const UserRouter = require("./routes/user.route.js");
const EventRouter = require("./routes/event.route.js");
const GroupRouter = require("./routes/group.route.js");
const RedisClient = require("./service/configRedis.js");
const { exit } = require("process");

RedisClient.on('ready', async() => {

    console.log("Redis is ready to use");
    const cacheConfig = require("./service/cacheData.js");
    await cacheConfig.ClearAllCacheASYNC();
    const [EventCacheResult] = await Promise.all([
        cacheConfig.preCacheEvents(),
        cacheConfig.preCacheUser(),
        cacheConfig.preCacheEventJOINGroupAndUser(),
        cacheConfig.preCacheUnsafeUser(),
        cacheConfig.preCacheAuthority()
    ]);

    if (EventCacheResult) {
        await Promise.all(
            [
                cacheConfig.preCacheGroup(),
                cacheConfig.preCacheGroupJoinUser()
            ]
        );
    }
    
});

RedisClient.on('error', (error) => {
    console.log("Redis error: ", error);
    exit(1);
});

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/events", EventRouter);
app.use("/api/v1/groups", GroupRouter);

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
            data: err.data,
        });
    } else {
        return res.status(500).json({ message: "Internal Server Error", info: err.message });
    }
});

module.exports = app;