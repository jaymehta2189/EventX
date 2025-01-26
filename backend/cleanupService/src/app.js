const express = require("express");
const app = express();
const cors = require('cors');

app.get("/",(req,res)=>{
    return res.send("hello");
});

const cleanup = require('./controllers/cleanDB');

app.get("/clean",cleanup.cleanExpierDataFromDatabaseAndCloudinary);

app.get("/stop",cleanup.stopJob);

app.get("/resume",cleanup.resumeJob);

app.use((err, req, res, next) => {
    return res.status(500).json({ message: "Internal Server Error", info: err.message });
});

module.exports = app;