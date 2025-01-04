const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const SimpleEvent = require("../../models/v1/simpleevent.model");
const User_SE_Join = require("../../models/v1/user_se_join.model");
const User = require("../../models/user.model");
const Speaker = require("../../models/v1/speaker.model");
const EventBase = require("../../models/v1/eventbase.model");
const { SimpleEventError, SimpleEventSuccess } = require("../../utils/Constants/v1/SimpleEvent");

const mongoose = require("mongoose");
const moment = require("moment-timezone");

// const createSimpleEvent = asyncHandler(async (req, res) => {
//     const { event, speakers, creator, timeLimit } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(event) || !mongoose.Types.ObjectId.isValid(speakers) || !mongoose.Types.ObjectId.isValid(creator)) {
//         throw new ApiError(400, "Invalid ID");
//     }

//     const simpleEvent = new SimpleEvent.create({
//         event,
//         speakers,
//         creator,
//         timeLimit
//     });

//     return res.status(201).json(new ApiResponse(simpleEvent));
// });

const validateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.body;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(SimpleEventError.INVALID_EVENT_ID);
    }

    const eventbase = await EventBase.exists({_id: new mongoose.Types.ObjectId(eventId)});

    if (!eventbase) {
        throw new ApiError(SimpleEventError.EVENT_NOT_FOUND);
    }

    return res
        .status(SimpleEventError.EVENT_FOUND.statusCode)
        .json(new ApiResponse(SimpleEventError.EVENT_VALIDATED));
});

const validateAndInsertSpeaker = asyncHandler(async (req, res) => {
    if(req.user.role !== User.allowedRoles[1]){
        throw new ApiError(SimpleEventError.INVALID_MEMBER_ROLE);
    }

    const {name , description} = req.body;

    if(!name){
        throw new ApiError(SimpleEventError.MISSING_SPEAKER_NAME);
    }

    const _  = await Speaker.exists({name});

    if(_){
        return res
                .status(SimpleEventError.SPEAKER_EXISTS.statusCode)
                .json(new ApiResponse(SimpleEventError.SPEAKER_EXISTS));
    }

    const speaker =  await Speaker.create({
        name,
        description
    }).select("_id");

    return res
            .status(SimpleEventError.SPEAKER_CREATED.statusCode)
            .json(new ApiResponse(SimpleEventError.SPEAKER_CREATED,speaker._id));
});

const validateJoinLimit = asyncHandler(async (req, res) => {
    const { joinLimit } = req.body;

    if (!joinLimit || joinLimit < 1 || !Number.isInteger(joinLimit)) {
        throw new ApiError(SimpleEventError.INVALID_JOIN_LIMIT);
    }

    return res
        .status(SimpleEventError.JOIN_LIMIT_VALIDATED.statusCode)
        .json(new ApiResponse(SimpleEventError.JOIN_LIMIT_VALIDATED));
});

const createSimpleEvent = asyncHandler(async (req, res) => {
    if(req.user.role !== User.allowedRoles[1]){
        throw new ApiError(SimpleEventError.INVALID_MEMBER_ROLE);
    }

    const { eventId, speaker , joinLimit } = req.body;

    try{
        const simpleEvent = await SimpleEvent.create({
            event: eventId,
            speaker,
            creator: req.user._id,
            joinLimit,
            timeLimit: new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
        });

        return res
                .status(SimpleEventError.SIMPLE_EVENT_CREATED.statusCode)
                .json(new ApiResponse(SimpleEventError.SIMPLE_EVENT_CREATED,simpleEvent._id));
    }catch(error){
        if (error.name === "ValidationError") {
            throw new ApiError(SimpleEventError.VALIDATION_ERROR, error.message);
        }
        console.log(error.message);
        throw new ApiError(SimpleEventError.SIMPLE_EVENT_CREATION_FAILED,error.message);
    }
});

const QrCodeScan = asyncHandler(async (req, res) => {
    if (req.user.role !== "user") {
        throw new ApiError(SimpleEventError.INVALID_MEMBER_ROLE);
    }

    const simpleEvent = await SimpleEvent.findById(req.params.id);
    if (!simpleEvent) {
        throw new ApiError(SimpleEventError.INVALID_EVENT);
    }

    const existingRecord = await User_SE_Join.findOne({
        SimpleEvent: req.params.id,
        Member: req.user._id
    })
        .select("_id isPresent")
        .lean();

    if (!existingRecord) {
        throw new ApiError(SimpleEventError.USER_INVALID);
    }

    if (existingRecord.isPresent) {
        throw new ApiError(SimpleEventError.USER_ALREADY_PRESENT);
    }

    const user = await User_SE_Join.findByIdAndUpdate(existingRecord._id, { isPresent: true }, { new: true });

    return res
        .status(SimpleEventSuccess.USER_PRESENT.statusCode)
        .json(new ApiResponse(SimpleEventSuccess.USER_PRESENT));
});

const NotifiedAttendanceMailToHOD = async (eventDetails, jsondata) => {

};

const OrgCheckAttendance = asyncHandler(async (req, res) => {
    if (req.user.role !== "org") {
        throw new ApiError(SimpleEventError.INVALID_MEMBER_ROLE);
    }

    const Find_start_date = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.params.id) // Match the specific SimpleEvent by ID
            }
        },
        {
            $lookup: {
                from: "eventbases", // The name of the EventBase collection
                localField: "event", // The field in SimpleEvent that references EventBase
                foreignField: "_id", // The field in EventBase to match
                as: "eventDetails" // The resulting EventBase document will be stored in this field
            }
        },
        {
            $unwind: "$eventDetails" // Flatten the array created by $lookup
        },
        {
            $project: {
                "event": 1, // Include the event ID
                "creator": 1, // Include the creator
                "eventDetails.startDate": 1, // Include the startDate from EventBase
                "eventDetails.endDate": 1, // Include the endDate from EventBase
                "eventDetails.name": 1 // Include the branch from EventBase
            }
        }
    ];

    const simpleEvent = await SimpleEvent.aggregate(Find_start_date).exec();

    if (!simpleEvent || simpleEvent.length === 0) {
        throw new ApiError(SimpleEventError.INVALID_EVENT);
    }

    const enddate = moment.tz(simpleEvent[0].eventDetails.endDate, "Asia/Kolkata");
    const currentdate = moment.tz(new Date(), "Asia/Kolkata");

    if (currentdate.isBefore(enddate)) {
        throw new ApiError(SimpleEventError.EVENT_NOT_ENDED_YET);
    }

    if (req.user._id !== simpleEvent[0].creator) {
        throw new ApiError(SimpleEventError.INVALID_CREATOR);
    }

    const Branches = User.Branches;

    const pipeline = [
        {
            $match: {
                SimpleEvent: new mongoose.Types.ObjectId(req.params.id),
                isPresent: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "Member",
                foreignField: "_id",
                as: "users"
            }
        },
        {
            $unwind: "$users"
        },
        {
            $project: {
                "users.branch": 1,
                "users.email": 1,
                "users._id": 1
            }
        },
        {
            $match: {
                "users.branch": { $in: Branches }
            }
        },
        {
            $group: {
                _id: "$users.branch",
                includedMembers: { $push: "$users.email" }
            }
        }
    ];

    const result = await User_SE_Join.aggregate(pipeline).exec();
    if (!result) {
        throw new ApiError(SimpleEventError.NO_MEMBERS_FOUND);
    }

    NotifiedAttendanceMailToHOD(simpleEvent[0], result);

    return res
        .status(SimpleEventSuccess.ORG_CHECK_ATTENDANCE.statusCode)
        .json(new ApiResponse(SimpleEventSuccess.ORG_CHECK_ATTENDANCE));

});

const UserJoinEvent = asyncHandler(async (req, res) => {

    const { eventId } = req.body;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(SimpleEventError.INVALID_EVENT_ID);
    }

    const event = await SimpleEvent.findById(eventId).select("timeLimit").lean();

    if (!event) {
        throw new ApiError(SimpleEventError.EVENT_NOT_FOUND);
    }

    const user = await User_SE_Join.create({
        SimpleEvent: eventId,
        Member: req.user._id,
        timeLimit: event.timeLimit
    });

    return res
        .status(SimpleEventSuccess.USER_JOINED_EVENT.statusCode)
        .json(new ApiResponse(SimpleEventSuccess.USER_JOINED_EVENT, user));
});

module.exports = {

};