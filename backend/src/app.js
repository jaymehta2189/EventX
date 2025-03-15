const express = require("express");
const http = require('http');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const path = require("path");
const ApiError = require("./utils/ApiError.js");
const session = require('express-session');
const { exit } = require("process");

// const {socketConfig} = require('./service/configWebSocket.js');
const app = express();
const server = http.createServer(app);

const rateLimit = require("./middleware/rateLimit.js");

// socketConfig(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}));

app.use(
session(
    {
        secret: process.env.SESSION_SECRET_KEY, 
        resave: false, 
        saveUninitialized: true 
    }
));

app.use(rateLimit);


// =======================
const UserRouter = require("./routes/user.route.js");
const EventRouter = require("./routes/event.route.js");
const GroupRouter = require("./routes/group.route.js");
const {RedisClient} = require("./service/configRedis.js");
const {AuthRouter} = require("./routes/auth.route.js");
// =======================

RedisClient.on('ready', async() => {
    const cacheConfig = require("./service/cacheData.js");
    await cacheConfig.ClearAllCacheASYNC();
    const [EventCacheResult] = await Promise.all([
        cacheConfig.preCacheEvents(),
        cacheConfig.preCacheUser(),
        cacheConfig.preCacheEventJOINGroupAndUser(),
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

    console.log("Redis is ready.");
});

RedisClient.on('error', (error) => {
    console.log("Redis error: ", error);
    exit(1);
});

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/events", EventRouter);
app.use("/api/v1/groups", GroupRouter);
app.use("/api/v1/auth", AuthRouter);

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

module.exports = server;