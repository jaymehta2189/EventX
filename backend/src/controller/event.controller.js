const Event = require("../models/event.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { EventError , EventSuccess} = require("../utils/Constants/Event");
const User = require("../models/user.model");

// this use for check event is full or not
// give timelimit and userlimit
// function checkEventFull(req, res, next) {

//     const eventId = req.params.id;
    
//     if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
//         throw new ApiError(EventError.INVALID_EVENT_ID);
//     }

//     const event = await Event.findById(eventId).select("joinGroup groupLimit");
//     if (!event) {
//         throw new ApiError(EventError.EVENT_NOT_FOUND);
//     }
//     const groupCount = await Group.countDocuments({ event: eventId });

//     if (groupCount >= event.groupLimit) {
//         throw new ApiError(EventError.EVENT_FULL);
//     }

//     return res
//             .status(EventSuccess.EVENT_NOT_FULL.statusCode)
//             .json(new ApiResponse(EventSuccess.EVENT_NOT_FULL,
//                 {
//                     timeLimit:event.timeLimit,
//                     userLimit:event.userLimit
//                 }
//             ));
// };

// name should be trim or lowercase
async function validateSameNameEvent (name){

    const existEvent = await Event.findOne({ name }).select("_id").lean();
    
    if (existEvent) {
        throw new ApiError(EventError.SAME_NAME);
    }

};

async function validateDate (startDate,endDate){
    const istNow = moment.tz(Date.now(), "Asia/Kolkata");
    const istStartDate = moment.tz(startDate, "Asia/Kolkata");
    
    if(!istStartDate.isAfter(istNow)){
        throw new ApiError(EventError.INVALID_START_DATE);
    }

    const istEndDate = moment.tz(endDate, "Asia/Kolkata");
    
    if(!istEndDate.isAfter(istStartDate)){
        throw new ApiError(EventError.INVALID_END_DATE);
    }

    return { istStartDate , istEndDate};
};

async function validateBranch(branchs) {
    const setOfBranch  = [...new Set(branchs)];
    if(!setOfBranch.every( branch => Event.allowBranch.includes(branch))){
        throw new ApiError(EventError.INVALID_BRANCH);
    };
}

// give free location
const FreeLocationFromTime = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;
    const allowLocation = Event.allowLocation;

    const istStartDate = moment.tz(startDate, "Asia/Kolkata").toDate();
    const istEndDate = moment.tz(endDate, "Asia/Kolkata").toDate();

    const FreeLocationPipeline = [
        {
            $match: {
                startDate: { $lte: istEndDate }, // Match events where startDate is before or equal to the requested endDate
                endDate: { $gte: istStartDate } // Match events where endDate is after or equal to the requested startDate
            }
        },
        {
            $project: {
                location: 1
            }
        },
        {
            $group: {
                _id: null,
                overlappingLocations: { $addToSet: "$location" }
            }
        },
        {
            $project: {
                freeLocations: {
                    $setDifference: [
                        allowLocation,
                        "$overlappingLocations"
                    ]
                }
            }
        }
    ];

    const result = await Event.aggregate(FreeLocationPipeline).lean();

    // Handle the case where no events exist in the database
    const FreeLocation =
        result.length > 0 && result[0]?.freeLocations
            ? result[0].freeLocations
            : allowLocation;

    if (FreeLocation.length === 0) {
        throw new ApiError(EventError.LOCATION_ALREADY_BOOKED);
    }

    return res
        .status(EventSuccess.FREE_LOCATIONS_FOUND.statusCode)
        .json(new ApiResponse(EventSuccess.FREE_LOCATIONS_FOUND, FreeLocation));
});


// input category should be trim or lowercase
async function validateCategory (category){
    if(!Event.allowCategory.includes(category)){
        throw new ApiError(EventError.INVALID_CATEGORY);
    }
};

const findAllEventsByOrgId = async function (orgId, fields = null) {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(EventError.CREATOR_NOT_FOUND , orgId);
    }

    const events = await Event.find({ creator: orgId }).select(fields).lean();
    
    return events;
};

// add middleware
const createEvent = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, location, category, pricePool, description, groupLimit, userLimit ,branchs , girlMinLimit} = req.body;
    
    if (!name || !startDate || !endDate || !location || !category || !pricePool || !description || !groupLimit || !userLimit || !girlMinLimit) {
        throw new ApiError(EventError.PROVIDE_ALL_FIELDS);
    }

    const [_, __, { istStartDate, istEndDate }] = await Promise.all([
        validateBranch(branchs),
        validateSameNameEvent(name),
        validateDate(startDate, endDate),
        validateCategory(category),
    ]);

    try {

        const timeLimit = new Date(new Date(endDate).getTime() + 2 * 24 * 60 * 60 * 1000);

        const event = await Event.collection.insertOne({
            name,
            startDate : istStartDate.toDate(),
            endDate : istEndDate.toDate(),
            location,
            category,
            pricePool,
            groupLimit,
            userLimit,
            description,
            girlMinLimit,
            allowBranch:setOfBranch,
            creator:req.user._id,
            timeLimit
        });

        console.log(event);
        
        return res
            .status(EventSuccess.EVENT_CREATED.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_CREATED, {id:event._id}));

    } catch (error) {

        if (error.name === "ValidationError") {
            throw new ApiError(EventError.VALIDATION_ERROR, error.message);
        }
        console.log(error.message);
        throw new ApiError(EventError.EVENT_CREATION_FAILED,error.message); // Catch other errors
    }
});

const findAllEvent = asyncHandler(async (req, res) => {
    try {
        const events = await Event.aggregate([
            { $match: { startDate: { $gte: moment.tz(Date.now(), "Asia/Kolkata").toDate() } } },
            {
                $match: {
                    timeLimit: { $ne: null },
                    $expr: {
                        $gte: [
                            { $subtract: ["$timeLimit", moment.tz(Date.now(), "Asia/Kolkata").toDate()] },
                            2 * 60 * 60 * 1000
                        ]
                    }
                }
            },
            { 
                $match: { 
                    $expr: { $ne: ["$joinGroup", "$groupLimit"] } 
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
        ]).lean();

        // if(!events || events.length === 0){
        //     throw new ApiError(404, "No events found");
        // }
        return res
            .status(EventSuccess.EVENT_ALL_FOUND.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_ALL_FOUND, events));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(EventError.EVENT_NOT_FOUND, error.message);
    }
});

// view event
// .../:id
const viewEvent= asyncHandler(async (req, res) => {
    const id = req.params.id;

    const event = await Event.findById({_id:new mongoose.Types.ObjectId(id)})
            .select("-winnerGroup -timeLimit -creator -__v")
            .lean();

    if (!event) {
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
    return res.status(EventSuccess.EVENT_FOUND.statusCode).json(new ApiResponse(EventSuccess.EVENT_FOUND, event));
});

module.exports = {
    // function
    findAllEventsByOrgId,
    // see it
    // checkEventFull,
    FreeLocationFromTime,
    createEvent,
    findAllEvent,
    viewEvent
};