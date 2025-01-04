const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const EventBase = require("../../models/v1/eventbase.model");
const SimpleEvent = require("../../models/v1/simpleevent.model");
const { EventBaseError, EventBaseSuccess } = require("../../utils/Constants/v1/EventBase");
async function OverLappingLocation(location, startDate, endDate) {
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
            }
        ];

        const result = await EventBase.aggregate(pipeline).exec();

        return { eventCount: result.length, overlappingEvents: result };

    } catch (err) {
        throw new ApiError(EventBaseError.OVERLAPPING_EVENT_BASE_FAILED, err.message);
    }
};

// give input location, startdate, enddate
// location should be trim or lowercase
const validateEventBaseLocation = asyncHandler(async (req, res) => {
    const { location, startDate, endDate } = req.body;

    if (!location) {
        throw new ApiError(EventBaseError.LOCATION_NOT_FOUND);
    }

    const eventCount = await OverLappingLocation(location, startDate, endDate);

    if (eventCount > 0) {
        throw new ApiError(EventBaseError.LOCATION_ALREADY_BOOKED);
    }
    return res.status(EventBaseSuccess.LOCATION_VALIDATED.statusCode).json(new ApiResponse(EventBaseSuccess.LOCATION_VALIDATED));
});

// name should be trim or lowercase
const validateSameNameEventBase = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        throw new ApiError(EventBaseError.MISSING_NAME);
    }
    const exists_same_name_event = await EventBase.exists({ name });

    if (exists_same_name_event) {
        throw new ApiError(EventBaseError.SAME_NAME);
    }

    return res
        .status(EventBaseSuccess.NAME_VALIDATED.statusCode)
        .json(new ApiResponse(EventBaseSuccess.NAME_VALIDATED));
});

const validateStartDate = asyncHandler(async (req, res) => {
    const { startDate } = req.body;

    if (!startDate) {
        throw new ApiError(EventBaseError.MISSING_START_DATE);
    }

    const istNow = moment.tz(Date.now(), "Asia/Kolkata");
    const istStartDate = moment.tz(startDate, "Asia/Kolkata");

    if (!istStartDate.isValid()) {
        throw new ApiError(EventBaseError.INVALID_START_FORMAT);
    }

    if (!istStartDate.isAfter(istNow)) {
        throw new ApiError(EventBaseError.INVALID_START_DATE);
    }

    return res
        .status(EventBaseSuccess.START_DATE_VALIDATED.statusCode)
        .json(new ApiResponse(EventBaseSuccess.START_DATE_VALIDATED));
});

// give input startdate and enddate
const validateEndDate = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;

    if (!endDate) {
        throw new ApiError(EventBaseError.MISSING_END_DATE);
    }

    const istStartDate = moment.tz(startDate, "Asia/Kolkata");
    const istEndDate = moment.tz(endDate, "Asia/Kolkata");

    if (!istEndDate.isValid()) {
        throw new ApiError(EventBaseError.INVALID_END_FORMAT);
    }

    if (!istEndDate.isAfter(istStartDate)) {
        throw new ApiError(EventBaseError.INVALID_END_DATE);
    }

    return res
        .status(EventBaseSuccess.END_DATE_VALIDATED.statusCode)
        .json(new ApiResponse(EventBaseSuccess.END_DATE_VALIDATED));
});

// input start and end date
const FreeLocationFromTime = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;
    const allowLocation = EventBase.allowLocation;

    const istStartDate = moment.tz(startDate, "Asia/Kolkata").toDate();
    const istEndDate = moment.tz(endDate, "Asia/Kolkata").toDate();

    const FreeLocationPipline = [
        {
            $match: {
                startDate: { $lte: istEndDate },
                endDate: { $gte: istStartDate }
            },
        },
        {
            $project: {
                location: 1
            }
        }
    ];

    const OverlappingLocation = await EventBase.aggregate(FreeLocationPipline).exec();

    const FreeLocation = allowLocation.filter((location) => !OverlappingLocation.includes(location));

    if (FreeLocation.length === 0) {
        throw new ApiError(EventBaseError.LOCATION_FULL);
    }

    return res
        .status(EventBaseSuccess.FREE_LOCATIONS_FOUND.statusCode)
        .json(new ApiResponse(EventBaseSuccess.FREE_LOCATIONS_FOUND, FreeLocation));
});

// input category should be trim or lowercase
const validateCategory = asyncHandler(async (req, res) => {
    const { category } = req.body;
    if (!category) {
        throw new ApiError(EventBaseError.MISSING_CATEGORY);
    }

    if (!EventBase.allowCategory.includes(category)) {
        throw new ApiError(EventBaseError.INVALID_CATEGORY);
    }

    return res
        .status(EventBaseSuccess.CATEGORY_VALIDATED.statusCode)
        .json(new ApiResponse(EventBaseSuccess.CATEGORY_VALIDATED));
});

// add middleware to check organizer role
const createEventBase = asyncHandler(async (req, res) => {

    const { name, startDate, endDate, location, category, description } = req.body;

    if (!name || !startDate || !endDate || !location || !category || !description) {
        throw new ApiError(EventBaseError.PROVIDE_ALL_FIELDS);
    }

    const startDateIst = moment.tz(startDate, "Asia/Kolkata").toDate();
    const endDateIst = moment.tz(endDate, "Asia/Kolkata").toDate();

    try {

        const timeLimit = new Date(endDateIst.getTime() + 2 * 60 * 60 * 1000);

        const event = await EventBase.create({
            name,
            startDate: startDateIst,
            endDate: endDateIst,
            location,
            category,
            description,
            creator: req.user._id,
            timeLimit
        });

        return res
            .status(EventBaseSuccess.EVENT_BASE_CREATED.statusCode)
            .json(new ApiResponse(EventBaseSuccess.EVENT_BASE_CREATED, { _id: event._id }));

    } catch (error) {
        if (error.name === "ValidationError") {
            throw new ApiError(EventBaseError.VALIDATION_ERROR, error.message);
        }
        console.log(error.message);
        throw new ApiError(EventBaseError.EVENT_BASE_CREATION_FAILED, error.message); // Catch other errors
    }
});

const findAllEventBase = asyncHandler(async (req, res) => {
    try {
        const events = await EventBase.aggregate([
            { $match: { startDate: { $gte: moment.tz(new Date(), "Asia/Kolkata").toDate() } } },
            {
                $match: {
                    timeLimit: { $ne: null },
                    $expr: {
                        $gte: [
                            { $subtract: ["$timeLimit", moment.tz(new Date(), "Asia/Kolkata").toDate()] },
                            2 * 60 * 60 * 1000
                        ]
                    }
                }
            },
            { $sample: { size: 10 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    startDate: 1,
                    endDate: 1,
                    location: 1,
                    category: 1,
                    avatar: 1
                }
            }
        ]).exec();

        // if(!events || events.length === 0){
        //     throw new ApiError(404, "No events found");
        // }
        return res
            .status(EventBaseSuccess.EVENT_BASE_ALL_FOUND.statusCode)
            .json(new ApiResponse(EventBaseSuccess.EVENT_BASE_ALL_FOUND, events));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(EventBaseError.EVENT_BASE_NOT_FOUND, error.message);
    }
});

const findEventTypeById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(EventBaseError.INVALID_EVENT_BASE_ID);
    }

    const isSimpleEvent = await SimpleEvent.findOne({ event: id }).select("_id").lean();

    if (isSimpleEvent) {
        return res
            .status(EventBaseSuccess.EVENT_BASE_FOUND.statusCode)
            .json(new ApiResponse(EventBaseSuccess.EVENT_BASE_FOUND, { _id: isSimpleEvent._id }));
    }

    try {
        await EventBase.findByIdAndDelete(id);

        return res
            .status(EventBaseSuccess.EVENT_BASE_NOT_FOUND.statusCode)
            .json(new ApiResponse(EventBaseSuccess.EVENT_BASE_NOT_FOUND));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(EventBaseError.EVENT_BASE_NOT_FOUND, error.message);
    }
});

// input should be trim or lowercase
const findEventBaseByName = asyncHandler(async (req, res) => {
    const name = req.params.name;
    if (!name) {
        throw new ApiError(EventBaseError.MISSING_NAME);
    }

    // find all events that start with the given name
    const events = await EventBase.find({
        name: { $regex: new RegExp(`^${name}`, "i") }
    }).select("_id name avatar startDate endDate location category");

    if (!events) {
        throw new ApiError(EventBaseError.EVENT_BASE_NOT_FOUND);
    }

    return res
        .status(EventBaseSuccess.EVENT_BASE_FOUND.statusCode)
        .json(new ApiResponse(EventBaseSuccess.EVENT_BASE_FOUND, events));
});

//input should be trim or lowercase
const searchEventBase = asyncHandler(async (req, res) => {
    const { creatorName, name, category, location, startDate, endDate } = req.body;

    // Validate if at least one field is provided
    if (!creatorName && !name && !category && !location && !startDate && !endDate) {
        throw new ApiError(EventBaseError.PROVIDE_ALL_FIELDS);
    }

    const query = {};

    if (creatorName) {
        const creator = await User.findOne({ name, role: User.allowedRoles[1] }).select("_id");
        if (!creator) {
            throw new ApiError(EventBaseError.CREATOR_NOT_FOUND);
        }
        query.creator = creator._id;
    }
    if (name) {
        query.name = { $regex: new RegExp(`^${name}`, "i") }; // Partial match, case-insensitive
    }
    if (category) {
        query.category = category; // Partial match, case-insensitive
    }
    if (location) {
        query.location = location; // Partial match, case-insensitive
    }

    // Handle date range query
    if (startDate || endDate) {
        query.startDate = {};
        if (startDate) {
            query.startDate.$gte = moment.tz(startDate, "Asia/Kolkata").toDate();
        }
        if (endDate) {
            query.startDate.$lte = moment.tz(endDate, "Asia/Kolkata").toDate();
        }
    }

    query.$expr = {
        $gte: [
            { $subtract: ["$timeLimit", moment.tz(new Date(), "Asia/Kolkata").toDate()] }, // Remaining time in milliseconds
            2 * 60 * 60 * 1000 // 2 hours in milliseconds
        ]
    };

    // Fetch events
    try {
        const events = await EventBase.find(query)
            .select(
                "_id name avatar startDate endDate location category"
            );

        if (!events || events.length === 0) {
            throw new ApiError(EventBaseError.EVENT_BASE_NOT_FOUND);
        }

        return res
            .status(EventBaseSuccess.EVENT_BASE_ALL_FOUND.statusCode)
            .json(EventBaseSuccess.EVENT_BASE_ALL_FOUND, events);

    } catch (error) {
        console.log(error.message);
        throw new ApiError(EventBaseError.EVENT_BASE_NOT_FOUND, error.message);
    }
});

module.exports = {
    validateSameNameEventBase,
    validateStartDate,
    validateEndDate,
    // no need to export OverLappingLocation
    // no need because FreeLocationFromTime is used in validateEventBaseLocation
    validateEventBaseLocation,
    FreeLocationFromTime,
    validateCategory,
    createEventBase,
    // when click on event, find event by id
    findEventTypeById,
    // give all fields in body
    findAllEventBase,
    findEventBaseByName,
    searchEventBase
};