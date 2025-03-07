const User = require("../models/user.model");
const Event = require("../models/event.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { EventError, EventSuccess } = require("../utils/Constants/Event");

const { getGroupDetails } = require("./group.controller");
const { RedisClient } = require("../service/configRedis");
const cacheData = require("../service/cacheData");
const Group = require("../models/group.model");

const cacheConfig = require("../service/cacheData");
const json2csv = require('json2csv').parse;
const fs = require('fs');
const path = require('path');
const { transporter } = require('nodemailer');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const { isNumberObject } = require("util/types");
const { eventNames } = require("process");
const { error } = require("console");
const { broadcastToRoom } = require("../service/configWebSocket");

function isundefine(variable) {
    return typeof variable === 'undefined';
}

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

                pipeline = RedisClient.pipeline();
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
    if (typeof branchs === 'string') {
        try {
            branchs = JSON.parse(branchs);
        } catch (error) {
            throw new ApiError(EventError.INVALID_BRANCH);
        }
    }

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
                    if (!event[0] && event[1]) {
                        eventDetails.push(...JSON.parse(event[1]));
                    }
                });

                pipeline = RedisClient.pipeline();
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
    console.log(Event.allowCategory);
    if (!Event.allowCategory.includes(category)) {
        throw new ApiError(EventError.INVALID_CATEGORY);
    }
};

const findAllEventsByOrgId = async function (orgId, fields = null) {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(EventError.CREATOR_NOT_FOUND, orgId);
    }

    const events = await Event.find({ creator: orgId }).select(fields).lean();

    return events;
};

// add middleware
const createEvent = asyncHandler(async (req, res) => {
    let { name, startDate, endDate, location, category, pricePool, description, groupLimit, userLimit, branchs, girlMinLimit } = req.body;
    girlMinLimit = parseInt(girlMinLimit);
    groupLimit = parseInt(groupLimit);
    userLimit = parseInt(userLimit);
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
    let avatar = null;
    if (req.file && req.file.path) {
        avatar = await uploadOnCloudinary(req.file.path);
    }

    let avatarUrl = avatar ? avatar : "https://res.cloudinary.com/dlswoqzhe/image/upload/v1736367840/Collaborative-Coding.-A-developer-team-working-together.-min-896x504_mnw9np.webp";

    try {
        const timeLimit = new Date(new Date(endDate).getTime() + 30 * 24 * 60 * 60 * 1000);

        const event = await Event.create({
            name,
            startDate: istStartDate.toDate(),
            endDate: istEndDate.toDate(),
            location,
            category,
            avatar: avatarUrl,
            pricePool,
            groupLimit,
            userLimit,
            description,
            girlMinLimit,
            allowBranch: setOfBranch,
            creator: req.user._id,
            timeLimit
        });

        cacheConfig.cacheEvent(event);

        if (setOfBranch.includes('all')) {
            Event.allowBranch.forEach(branch => {
                broadcastToRoom(branch, event, "create-event");
            });
        } else {
            setOfBranch.forEach(branch => {
                broadcastToRoom(branch, event, "create-event");
            });
        }

        return res
            .status(EventSuccess.EVENT_CREATED.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_CREATED, { id: event._id }));

    } catch (error) {
        if (error.name === "ValidationError") {
            throw new ApiError(EventError.VALIDATION_ERROR, error.message);
        }
        throw new ApiError(EventError.EVENT_CREATION_FAILED, error.message);
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
                    creator: 1,
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
    try {
        const id = req.params.id;

        const event = await Event.findById({ _id: new mongoose.Types.ObjectId(id) })
            .select("-winnerGroup -timeLimit -creator -__v")
            .lean();

        if (!event) {
            throw new ApiError(EventError.EVENT_NOT_FOUND);
        }

        const existGroup = await getGroupDetails(id, req.user._id);

        return res.status(EventSuccess.EVENT_FOUND.statusCode).json(new ApiResponse(EventSuccess.EVENT_FOUND, { event, existGroup }));
    } catch (err) {
        console.log(err.message);
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
});

async function cacheViewEvent(req, res, next) {
    try {
        const id = req.params.id;
        const events = await cacheData.GetEventDataById('$', id);

        if (events.length !== 0) {

            const event = events[0];
            const existGroup = await getGroupDetails(id, req.user._id);
            return res.status(EventSuccess.EVENT_FOUND.statusCode).json(new ApiResponse(EventSuccess.EVENT_FOUND, { event, existGroup }));
        }

        throw new ApiError(EventError.EVENT_NOT_FOUND);

    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        console.log("scn ,msdc", error.message);
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
                    pipeline.get(key);
                });

                const ids = await pipeline.exec();
                pipeline = RedisClient.pipeline();

                ids.forEach(idResult => {
                    if (idResult[0] === null) {
                        pipeline.call('JSON.GET', `Event:FullData:${idResult[1]}`, '$');
                    }
                });

                const eventsData = await pipeline.exec();

                pipeline = RedisClient.pipeline();

                eventsData.forEach(event => {
                    if (!event[0] && event[1]) {
                        const parsedEvent = JSON.parse(event[1]);
                        if (parsedEvent) {
                            activeEvents.push(...parsedEvent);
                        }
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

        const isStaff = req.user.role != "admin" || req.user.role != "staff";
        const branchCode = isStaff ? 'all' : req.user.email.substring(2, 4);
        const PrersentTime = moment.tz(Date.now(), "Asia/Kolkata");

        const filteredEvents = activeEvent.filter(event => {
            const timeDifferenceIsMoreThanTwoHours = new Date(event.timeLimit) - PrersentTime > 7200000;
            const isAllowedBranch = branchCode === 'all' || event.allowBranch.includes('all') || event.allowBranch.includes(branchCode);
            const isFull = event.joinGroup === event.groupLimit;
            return timeDifferenceIsMoreThanTwoHours && isAllowedBranch && (isStaff || !isFull);
        });

        const allowEvent = filteredEvents.map(event => {
            return {
                _id: event._id,
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate,
                description: event.description,
                category: event.category,
                location: event.location,
                avatar: event.avatar
            }
        });

        return res.status(EventSuccess.EVENT_ALL_FOUND.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_ALL_FOUND, allowEvent));

    } catch (err) {
        console.log(err.message);
        next();
    }
}

async function generateCSVFilesForBranches(data) {
    const csvFilePaths = {};

    const csvDir = path.join(__dirname, '../../public/csv/');
    if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true });
    }

    for (const branch in data) {
        if (branch !== 'EventName' && branch !== 'StartDate' && branch !== 'EndDate') {
            try {
                if (data[branch].users) {
                    const csv = json2csv(data[branch].users);
                    const filePath = path.join(csvDir, `${branch}_event_data.csv`);
                    fs.writeFileSync(filePath, csv);
                    csvFilePaths[branch] = filePath;
                } else {
                    console.error(`No users found for branch ${branch}`);
                }
            } catch (error) {
                console.error(`Error generating CSV for branch ${branch}:`, error);
            }
        }
    }

    return csvFilePaths;
}

async function deleteCSVFiles(csvFilePaths) {
    try {
        const deletePromises = Object.values(csvFilePaths).map((filePath) => {
            return fs.promises.unlink(filePath);
        });

        await Promise.all(deletePromises);

    } catch (err) {
        console.error('Error processing file deletions:', err);
    }
}

async function sendEmailsForBranch(branch, branchDetails, csvFilePaths) {
    const filePath = csvFilePaths[branch];
    if (!filePath) {
        console.warn(`No CSV file found for branch ${branch}. Email will not be sent.`);
        return;
    }

    for (const email of branchDetails.staffs) {
        const mailOptions = {
            from: 'EventX',
            to: email,
            subject: `Event Report: ${branchDetails.EventName}`, // ✅ Ensure event details are inside branchDetails
            text: `Please find attached the report for the event "${branchDetails.EventName}" held from ${branchDetails.StartDate} to ${branchDetails.EndDate}.`,
            attachments: [{ filename: `${branch}_event_data.csv`, path: filePath }]
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email}`);
        } catch (error) {
            console.error(`Error sending email to ${email}:`, error);
        }
    }
}


async function sendEmailsToHODs(branchData) {
    try {
        const csvFilePaths = await generateCSVFilesForBranches(branchData);

        const emailPromises = [];
        for (const branch of Object.keys(branchData)) {
            emailPromises.push(sendEmailsForBranch(branch, branchData[branch], csvFilePaths));
        }

        await Promise.all(emailPromises); 
        console.log('All emails processed.');

        await deleteCSVFiles(csvFilePaths);
        console.log('CSV files deleted after emails sent.');
    } catch (error) {
        console.error('Error in sending emails:', error);
    }
}

const validateAndSendHODEmails = asyncHandler(async (req, res) => {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(EventError.INVALID_EVENT_ID);
    }

    const events = await cacheData.GetEventDataById('$', eventId); // return array
    if (events.length === 0) {
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }

    const event = events[0];
    const currentTime = moment.tz(Date.now(), "Asia/Kolkata").toDate();

    if (new Date(event.endDate) > currentTime) {
        throw new ApiError(EventError.EVENT_NOT_END);
    }

    if (req.user._id !== event.creator) {
        throw new ApiError(GroupError.CREATOR_NOT_AUTHORIZED);
    }

    const joinedGroupIds = await RedisClient.smembers(`Event:Join:groups:${eventId}`);

    const joinedGroups = await cacheData.GetGroupDataById('$', ...joinedGroupIds);

    const scannedGroupIds = joinedGroups
        .filter(group => group.qrCodeScan)
        .map(group => group._id);

    const scannedUserIds = [];

    for (const groupId of scannedGroupIds) {
        const userIds = await RedisClient.smembers(`Group:Join:${groupId}`);
        scannedUserIds.push(...userIds);
    }

    const users = await cacheData.GetUserDataById('$', ...scannedUserIds);  

    if (users.length === 0) {
        throw new ApiError(EventError.NO_GROUPS_FOUND);
    }

    const branches = [...new Set(users.map(user => user.branch))];

    const BranchStaff = await findStaff(branches);

    const groupedUsersByBranch = users.reduce((result, user) => {
        const branchId = user.branch;
        if (!result[branchId]) {
            result[branchId] = {
                staffs: BranchStaff[branchId],
                users: []
            };
        }
        result[branchId].users.push({
            name: user.name,
            email: user.email,
            sem: user.sem
        });

        return result;
    }, {});

    console.log(groupedUsersByBranch);

    groupedUsersByBranch['EventName'] = event.name;
    groupedUsersByBranch['StartDate'] = event.startDate;
    groupedUsersByBranch['EndDate'] = event.endDate;

    // Send emails to all HODs
    sendEmailsToHODs(groupedUsersByBranch);

    return res
        .status(EventSuccess.SEND_MAIL.statusCode)
        .json(new ApiResponse(EventSuccess.SEND_MAIL));
});

async function findStaff(branches) { 
    // const authority = await ;
    let BranchStaff = {};

    for(const branch of branches){
        const ids = await RedisClient.smembers(`Authority:Branch:${branch}`);

        BranchStaff[branch] = await cacheData.GetAuthorityDataById("$.email",...ids);;
    }

    return BranchStaff;
}


const getAllEventCreateByOrg = asyncHandler(async (req, res) => {
    try {
        const orgId = req.params.orgId;
        const eventIds = await RedisClient.smembers(`Event:Org:${orgId}`);
        const events = await cacheData.GetEventDataById('$', ...eventIds);

        return res.status(EventSuccess.EVENT_ALL_FOUND.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_ALL_FOUND, events));
    } catch (err) {
        console.log(err.message);
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
});

const getGroupInEvent = asyncHandler(async (req, res) => {
    try {
        const eventId = req.params.id;

        const groupId = await RedisClient.smembers(`Event:Join:groups:${eventId}`);

        const groups = (await cacheData.GetGroupDataById('$', ...groupId)).filter(group => group.isVerified);

        return res.status(EventSuccess.EVENT_FOUND.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_FOUND, groups));
    } catch (err) {
        console.log(err.message);
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
});

const getUserInEvent = asyncHandler(async (req, res) => {
    try {
        const eventId = req.params.id;

        const userId = await RedisClient.smembers(`Event:Join:users:${eventId}`);

        const users = await cacheData.GetUserDataById('$', ...userId);

        return res.status(EventSuccess.EVENT_FOUND.statusCode)
            .json(new ApiResponse(EventSuccess.EVENT_FOUND, users));

    } catch (err) {
        console.log(err.message);
        throw new ApiError(EventError.EVENT_NOT_FOUND);
    }
});

const generateGroupReportCSV = asyncHandler(async (req, res) => {
    try {
        const { eventId } = req.body;

        const eventDetailss = await cacheData.GetEventDataById('$', eventId);
        if (eventDetailss.length === 0) {
            throw new ApiError(EventError.EVENT_NOT_FOUND);
        }

        const eventDetails = eventDetailss[0];

        const currentTime = moment.tz(Date.now(), "Asia/Kolkata").toDate();

        if (eventDetails.startDate > currentTime) {
            throw new ApiError(EventError.EVENT_NOT_START);
        }

        const groupIds = await RedisClient.smembers(`Event:Join:groups:${eventId}`);
        if (!groupIds.length) {
            throw new ApiError(EventError.NO_GROUPS_FOUND);
        }

        const groupData = await cacheData.GetGroupDataById('$', ...groupIds);
        const csvFields = ['Id', 'Name', 'Score'];

        const csvData = groupData.map(group => ({
            Id: group._id,
            Name: group.name,
            Score: '',
        }));

        const csv = json2csv(csvData, { fields: csvFields });
        const fileName = `${Date.now().toString()}.csv`;
        const filePath = path.join(__dirname, `../../public/csv/${fileName}`);

        const directoryPath = path.dirname(filePath);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        fs.writeFileSync(filePath, csv);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'text/csv');

        // Pipe file content to the response
        res.status(200).send(csv);

        res.on('finish', () => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                } else {
                    console.log(`Successfully deleted file ${filePath}`);
                }
            });
        });

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error("Error generating CSV report:", error.message);
        throw new ApiError(EventError.UNABLE_TO_GENERATE_CSV);
    }
});

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
    SameNameInCache,
    getGroupInEvent,
    getUserInEvent,
    getAllEventCreateByOrg,

    generateGroupReportCSV,
    // write findHOD
    validateAndSendHODEmails
};