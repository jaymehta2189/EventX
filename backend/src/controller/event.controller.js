const User = require("../models/user.model");
const Event = require("../models/event.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { EventError, EventSuccess } = require("../utils/Constants/Event");


const RedisClient = require("../service/configRedis");
const Group = require("../models/group.model");
const User_Event_Join = require("../models/User_Event_Join.model");

const cacheConfig = require("../service/cacheData");
function isundefine(variable) {
    return typeof variable === 'undefined';
}
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

async function SameNameInCache(EventName) {
    try {
        let cursor = '0';
        let pipeline = RedisClient.pipeline();
        do {
            const [newCursor, keys] = await RedisClient.scan(cursor, 'MATCH', 'Event:FullData:*');

            cursor = newCursor;
            if (keys.length > 0) {

                keys.forEach(idResult => {
                    pipeline.call('JSON.GET', idResult, '$.name');
                });

                const eventsData = await pipeline.exec();
                // output like this [ [ null, '["hackx"]' ], [ null, '["tech 2"]' ] ]

                for (const event of eventsData) {
                    if (!event[0] && JSON.parse(event[1])[0] === EventName) {
                        return false;
                    }
                }

                pipeline.reset();
            }
        } while (cursor !== '0');

        return true;
    } catch (error) {
        console.error('Error fetching active events:', error);
        return false;
    }
};

async function validateSameNameEvent(name) {

    // const existEvent = await Event.findOne({ name }).select("_id").lean();

    const isValidName = await SameNameInCache(name);

    if (!isValidName) {
        throw new ApiError(EventError.SAME_NAME);
    }

};

async function validateDate(startDate, endDate) {
    const istNow = moment.tz(Date.now(), "Asia/Kolkata");
    const istStartDate = moment.tz(startDate, "Asia/Kolkata");

    if (!istStartDate.isAfter(istNow)) {
        throw new ApiError(EventError.INVALID_START_DATE);
    }

    const istEndDate = moment.tz(endDate, "Asia/Kolkata");

    if (!istEndDate.isAfter(istStartDate)) {
        throw new ApiError(EventError.INVALID_END_DATE);
    }
    return { istStartDate, istEndDate };
};

async function validateBranch(branchs) {
    const setOfBranch = [...new Set(branchs)];
    if (!setOfBranch.every(branch => [...User.Branches, 'all'].includes(branch))) {
        throw new ApiError(EventError.INVALID_BRANCH);
    };
    return setOfBranch;
}

async function validateLimit(userLimit, girlCount) {
    if (!Number.isInteger(userLimit) || !Number.isInteger(girlCount)) {
        throw new ApiError(EventError.INVALID_LIMIT);
    }

    if (userLimit < girlCount) {
        throw new ApiError(EventError.INVALID_GIRL_LIMIT);
    }
}


async function CacheFreeLocationFromTime(startDate, endDate) {
    const allowLocation = Event.allowLocation;

    const istStartDate = moment.tz(startDate, "Asia/Kolkata").toDate().getTime();
    const istEndDate = moment.tz(endDate, "Asia/Kolkata").toDate().getTime();

    try {
        let cursor = '0';
        let eventDetails = [];
        let pipeline = RedisClient.pipeline();

        do {
            const [newCursor, keys] = await RedisClient.scan(cursor, 'MATCH', 'Event:FullData:*');

            cursor = newCursor;
            if (keys.length > 0) {

                keys.forEach(idResult => {
                    pipeline.call('JSON.GET', idResult, '$');
                });

                const eventsData = await pipeline.exec();

                eventsData.forEach(event => {
                    if (!event[0]) {
                        eventDetails.push(...JSON.parse(event[1]));
                    }
                });

                pipeline.reset();
            }
        } while (cursor !== '0');

        const overlapEvent = eventDetails.filter(event => {
            const startEventTime = new Date(event.startDate).getTime();
            const endEventTime = new Date(event.endDate).getTime();

            return startEventTime <= istEndDate && endEventTime >= istStartDate;
        });

        const NotFreeLocation = new Set(overlapEvent.map(event => event.location));

        const FreeLocation = allowLocation.filter(location => !NotFreeLocation.has(location) && location !== "Online");

        return FreeLocation;
    } catch (error) {
        console.error('Error fetching active events:', error);
        return [];
    }
}

// give free location
const FreeLocationFromTime = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;

    // const allowLocation = Event.allowLocation;
    // const istStartDate = moment.tz(startDate, "Asia/Kolkata").toDate();
    // const istEndDate = moment.tz(endDate, "Asia/Kolkata").toDate();
    // const FreeLocationPipeline = [
    //     {
    //         $match: {
    //             startDate: { $lte: istEndDate }, // Match events where startDate is before or equal to the requested endDate
    //             endDate: { $gte: istStartDate } // Match events where endDate is after or equal to the requested startDate
    //         }
    //     },
    //     {
    //         $project: {
    //             location: 1
    //         }
    //     },
    //     {
    //         $group: {
    //             _id: null,
    //             overlappingLocations: { $addToSet: "$location" }
    //         }
    //     },
    //     {
    //         $project: {
    //             freeLocations: {
    //                 $setDifference: [
    //                     allowLocation,
    //                     "$overlappingLocations"
    //                 ]
    //             }
    //         }
    //     }
    // ];
    // const result = await Event.aggregate(FreeLocationPipeline).exec();
    // Handle the case where no events exist in the database

    const FreeLocation = await CacheFreeLocationFromTime(startDate, endDate);

    if (FreeLocation.length === 0) {
        throw new ApiError(EventError.LOCATION_ALREADY_BOOKED);
    }

    return res
        .status(EventSuccess.FREE_LOCATIONS_FOUND.statusCode)
        .json(new ApiResponse(EventSuccess.FREE_LOCATIONS_FOUND, FreeLocation));
});

// input category should be trim or lowercase
async function validateCategory(category) {
    if (!Event.allowCategory.includes(category)) {
        throw new ApiError(EventError.INVALID_CATEGORY);
    }
};

const findAllEventsByOrgId = async function (orgId, fields = null) {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(EventError.CREATER_NOT_FOUND, orgId);
    }

    const events = await Event.find({ creater: orgId }).select(fields).lean();

    return events;
};

// add middleware
const createEvent = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, location, category, pricePool, description, groupLimit, userLimit, branchs, girlMinLimit, avatar } = req.body;
    console.log("ndfkjngf,")
    console.log(name, startDate, endDate, location, category, pricePool, description, girlMinLimit, groupLimit, userLimit, branchs)

    if ([name, startDate, endDate, location, category, pricePool, description, groupLimit, userLimit, girlMinLimit].some(f => isundefine(f))) {
        throw new ApiError(EventError.PROVIDE_ALL_FIELDS);
    }

    const [setOfBranch, _, { istStartDate, istEndDate }] = await Promise.all([
        validateBranch(branchs),
        validateSameNameEvent(name),
        validateDate(startDate, endDate),
        validateCategory(category),
        validateLimit(userLimit, girlMinLimit)
    ]);

    console.log("nkjlgkj");

    if (req.files && req.files.avatar) {
        const localFilePath = req.files.avatar.path;
        avatar = await uploadOnCloudinary(localFilePath);
    }

    console.log("1111111111");
    console.log(setOfBranch);
    try {

        console.log(req.user._id);
        const timeLimit = new Date(new Date(endDate).getTime() + 2 * 24 * 60 * 60 * 1000);
        console.log("22222222222");

        const event = await Event.create({
            name,
            startDate: istStartDate.toDate(),
            endDate: istEndDate.toDate(),
            location,
            category,
            avatar,
            pricePool,
            groupLimit,
            userLimit,
            description,
            girlMinLimit,
            allowBranch: setOfBranch,
            creater: req.user._id,
            timeLimit
        });


        console.log(event);

        cacheConfig.cacheEvent(event);

        return res
            .status(EventSuccess.EVENT_CREATED.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_CREATED, { id: event._id }));

    } catch (error) {

        if (error.name === "ValidationError") {
            throw new ApiError(EventError.VALIDATION_ERROR, error.message);
        }
        console.log(error.message);
        throw new ApiError(EventError.EVENT_CREATION_FAILED, error.message); // Catch other errors
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
                            7200000
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
                    description: 1,
                    creater: 1,
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
            .status(EventSuccess.EVENT_ALL_FOUND.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_ALL_FOUND, events));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(EventError.EVENT_NOT_FOUND, error.message);
    }
});

// view event
// .../:id
const viewEvent = asyncHandler(async (req, res) => {
    const id = req.params.id;

    // const event = await RedisClient.call('JSON.GET','key','$')

    const event = await Event.findById({ _id: new mongoose.Types.ObjectId(id) })
        .select("-winnerGroup -timeLimit -creater -__v")
        .lean();

    if (!event) {
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
    return res.status(EventSuccess.EVENT_FOUND.statusCode).json(new ApiResponse(EventSuccess.EVENT_FOUND, event));
});

async function cacheViewEvent(req, res, next) {
    try {
        const id = req.params.id;
        const eventSTR = await RedisClient.call('JSON.GET', `Event:FullData:${id}`, '$');

        if (eventSTR) {
            const event = JSON.parse(eventSTR)[0];
            return res.status(EventSuccess.EVENT_FOUND.statusCode).json(new ApiResponse(EventSuccess.EVENT_FOUND, event));
        }
        next();
    } catch (error) {
        console.log(error.message);
        next();
    }
}

async function getActiveEventsFromCache() {
    try {
        let cursor = '0';
        let activeEvents = [];
        let pipeline = RedisClient.pipeline();

        do {
            const [newCursor, keys] = await RedisClient.scan(cursor, 'MATCH', 'Event:Search:Data:*');

            cursor = newCursor;
            if (keys.length > 0) {

                keys.forEach(key => {
                    pipeline.hget(key, 'id');
                });

                const ids = await pipeline.exec();
                pipeline = RedisClient.pipeline();

                ids.forEach(idResult => {
                    if (idResult[0] === null) {
                        pipeline.call('JSON.GET', `Event:FullData:${idResult[1]}`, '$');
                    }
                });

                const eventsData = await pipeline.exec();

                pipeline.reset();

                eventsData.forEach(event => {
                    if (!event[0]) {
                        activeEvents.push(...JSON.parse(event[1]));
                    }
                });
            }
        } while (cursor !== '0');

        return activeEvents;
    } catch (error) {
        console.error('Error fetching active events:', error);
        return [];
    }
}

async function cacheFindAllEvent(req, res, next) {
    try {
        const activeEvent = await getActiveEventsFromCache();

        const filteredEvents = activeEvent.filter(event => {

            const branchCode = req.user.email.substring(2, 4).toLowerCase();

            const timeDifferenceIsMoreThanTwoHours = new Date(event.timeLimit) - moment.tz(Date.now(), "Asia/Kolkata") > 7200000;
            const isAllowedBranch = event.allowBranch.includes('all') || event.allowBranch.includes(branchCode);
            const isFull = event.joinGroup === event.groupLimit;

            return timeDifferenceIsMoreThanTwoHours && isAllowedBranch && !isFull;
        });

        const allowedFields = [
            '_id',
            'name',
            'startDate',
            'endDate',
            'description',
            'creater',
            'location',
            'category',
            'avatar'
        ];

        const allowEvent = filteredEvents.map(event => {
            let finalEvent = {};
            allowedFields.forEach(field => {
                finalEvent[field] = event[field];
            });
            return finalEvent;
        });

        return res.status(EventSuccess.EVENT_ALL_FOUND.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_ALL_FOUND, allowEvent));

    } catch (err) {
        console.log(err.message);
        next();
    }
}

module.exports = {
    // function
    findAllEventsByOrgId,
    // see it
    // checkEventFull,
    FreeLocationFromTime,
    createEvent,
    findAllEvent,
    cacheFindAllEvent,

    viewEvent,
    cacheViewEvent,
    SameNameInCache
};