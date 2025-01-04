const { Schema, mongoose } = require('mongoose');
const {generateQRAndSaveAtCloudinary } = require('../../utils/generateQR');
const EventBase = require("./eventbase.model");
const ApiError = require('../../utils/ApiError');
const moment = require('moment-timezone');
const { verify } = require('jsonwebtoken');

const simpleEvent = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: "EventBase",
        required: true,
        index: true,
        unique: true
    },
    speaker:{
        type: Schema.Types.ObjectId,
        ref: "Speaker",
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    verifyByHOD:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    qrcode:{
        type:String,
        required:true
    },
    joinLimit: {
        type: Number,
        required: true,
        min: 1
    },
    timeLimit: {
        type: Date,
        required: true,
        expires: 2 * 60 * 60 * 1000
    }
});

simpleEvent.pre("save", async function (next) {
    try {
        this.qrcode = await generateQRAndSaveAtCloudinary(`http://localhost:${process.env.PORT}/api/simpleevent/qr/${this._id}`);
        await EventBase.findByIdAndUpdate(this.event, { $set:{timeLimit: this.timeLimit} });
        await verifyByHOD(this);
    }catch (error) {
        throw new ApiError(500,error.message);
    }
    next();
});

const SimpleEvent = mongoose.model("SimpleEvent", simpleEvent);
module.exports = SimpleEvent;