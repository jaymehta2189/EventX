const Event = require("../models/event.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Group = require("../models/group.model.js");

const { EventError , EventSuccess} = require("../utils/Constants/Event");

// this use for check event is full or not
// give timelimit and userlimit
const checkEventFull = asyncHandler(async (req, res) => {
    const {eventId} = req.body;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(EventError.INVALID_EVENT_ID);
    }

    const event = await Event.findById(eventId).select("groupLimit timeLimit userLimit");
    if (!event) {
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
    const groupCount = await Group.countDocuments({ event: eventId });

    if (groupCount >= event.groupLimit) {
        throw new ApiError(EventError.EVENT_FULL);
    }

    return res
            .status(EventSuccess.EVENT_NOT_FULL.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_NOT_FULL,
                {
                    timeLimit:event.timeLimit,
                    userLimit:event.userLimit
                }
            ));
});

// name should be trim or lowercase
const validateSameNameEvent = asyncHandler (async (req, res)=>{
    const {name} = req.body;
    if(!name){
        throw new ApiError(EventError.MISSING_NAME);
    }
    const existEvent = await Event.findOne({ name }).select("_id");

    if (existEvent) {
        throw new ApiError(EventError.SAME_NAME);
    }

    return res.status(EventSuccess.NAME_VALIDATED.statusCode).json(new ApiResponse(EventSuccess.NAME_VALIDATED));
});

const validateStartDate = asyncHandler (async (req, res)=>{
    const {startDate} = req.body;
    if(!startDate){
        throw new ApiError(EventError.MISSING_START_DATE);
    }
    const istNow = moment.tz(Date.now(), "Asia/Kolkata");
    const istStartDate = moment.tz(startDate, "Asia/Kolkata");
    if(!istStartDate.isAfter(istNow)){
        throw new ApiError(EventError.INVALID_START_DATE);
    }
    return res.status(EventSuccess.START_DATE_VALIDATED.statusCode).json(new ApiResponse(EventSuccess.START_DATE_VALIDATED));
});

// give input startdate and enddate
const validateEndDate = asyncHandler (async (req, res)=>{
    const {startDate,endDate} = req.body;
    if(!endDate){
        throw new ApiError(EventError.MISSING_END_DATE);
    }
    const istStartDate = moment.tz(startDate, "Asia/Kolkata");
    const istEndDate = moment.tz(endDate, "Asia/Kolkata");
    if(!istEndDate.isAfter(istStartDate)){
        throw new ApiError(EventError.INVALID_END_DATE);
    }
    return res.status(EventSuccess.END_DATE_VALIDATED.statusCode).json(new ApiResponse(EventSuccess.END_DATE_VALIDATED));
});

// give input location, startdate, enddate
// location should be trim or lowercase
const validateEventLocation = asyncHandler (async (req, res)=>{
    const {location,startDate,endDate} = req.body;

    if(!location){
        throw new ApiError(EventError.LOCATION_NOT_FOUND);
    }

    const eventCount = await OverLappingLocation(location, startDate, endDate);
    if(eventCount > 0){
        throw new ApiError(EventError.LOCATION_ALREADY_BOOKED);
    }
    return res.status(EventSuccess.LOCATION_VALIDATED.statusCode).json(new ApiResponse(EventSuccess.LOCATION_VALIDATED));
});

// input category should be trim or lowercase
const validateCategory = asyncHandler (async (req, res)=>{
    const {category} = req.body;
    if(!category){
        throw new ApiError(EventError.MISSING_CATEGORY);
    }
    if(!Event.allowCategory.includes(category)){
        throw new ApiError(EventError.INVALID_CATEGORY);
    }
    return res.status(EventSuccess.CATEGORY_VALIDATED.statusCode).json(new ApiResponse(EventSuccess.CATEGORY_VALIDATED));
});

const OverLappingLocation = async function (location, startDate, endDate) {
    try {

        const istStartDate = moment.tz(startDate, "Asia/Kolkata").toDate();
        const istEndDate = moment.tz(endDate, "Asia/Kolkata").toDate();

        const pipeline = [
            {
                $match: {
                    location: location,
                    startDate: { $lte: istEndDate },
                    endDate: { $gte: istStartDate },
                },
            },
            {
                $project: {
                    _id: 1,
                }
            },
        ];

        const result = await Event.aggregate(pipeline).exec();

        return { eventCount: result.length, overlappingEvents: result };

    } catch (err) {
        throw new ApiError(EventError.OVERLAPPING_EVENT_FAILED, err.message);
    }
};

const findAllEventsByOrgId = async function (orgId, fields = null) {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(EventError.CREATOR_NOT_FOUND , orgId);
    }

    const events = await Event.find({ creator: orgId }).select(fields);

    // if (!events || events.length === 0) {
    //     throw new ApiError(404, "No events found for the organization");
    // }
    
    return events;
};

const createEvent = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, location, category, pricePool, description, groupLimit, userLimit } = req.body;

    if (!name || !startDate || !endDate || !location || !category || !pricePool || !description || !groupLimit || !userLimit) {
        throw new ApiError(EventError.PROVIDE_ALL_FIELDS);
    }

    const creator = req.user._id;
    if (req.user.role !== "org") {
        throw new ApiError(EventError.CREATOR_ROLE_INVALID);
    }

    try {

        // const timeLimit = new Date(new Date(endDate).getTime() + 2 * 24 * 60 * 60 * 1000);

        const event = await Event.create({
            name,
            startDate,
            endDate,
            location,
            category,
            pricePool,
            groupLimit,
            userLimit,
            description,
            creator
            // timeLimit
        });

        return res.status(EventSuccess.EVENT_CREATED.statusCode).json(new ApiResponse(EventSuccess.EVENT_CREATED, event));

    } catch (error) {
        if (error.name === "ValidationError") {
            throw new ApiError(EventError.VALIDATION_ERROR, error.message);
        }
        console.log(error.message);
        throw new ApiError(EventError.EVENT_CREATION_FAILED,error.message); // Catch other errors
    }
});

const findAllEvent = asyncHandler(async (req, res) => {
    const events = await Event.aggregate([
        { $match: { startDate: { $gte: new Date() } } },
        { $sample: { size: 10 } },
        {
            $project: {
                _id: 1,
                name: 1,
                startDate: 1,
                endDate: 1,
                location: 1,
                category: 1,
                pricePool: 1,
                avatar: 1
            }
        }
    ]);

    // if(!events || events.length === 0){
    //     throw new ApiError(404, "No events found");
    // }
    return res.status(EventSuccess.EVENT_ALL_FOUND.statusCode).json(new ApiResponse(EventSuccess.EVENT_ALL_FOUND, events));
});

// input should be trim or lowercase
const findEventByName= asyncHandler(async (req, res) => {
    const name = req.params.name;
    if (!name) {
        throw new ApiError(EventError.MISSING_NAME);
    }

    const event = await Event.findOne({name}).select("_id name avatar startDate endDate location category pricePool description creator");

    if (!event) {
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
    return res.status(EventSuccess.EVENT_FOUND.statusCode).json(new ApiResponse(EventSuccess.EVENT_FOUND, event));
});

module.exports = {
    validateSameNameEvent,
    validateStartDate,
    validateEndDate,
    validateEventLocation,
    validateCategory,
    checkEventFull,
    createEvent,
    findAllEvent,
    findEventByName,
};