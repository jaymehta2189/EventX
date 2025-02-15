const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const Event = require("../models/event.model");
const User_Group_Join = require("../models/User_Group_Join.model");
const User_Event_Join = require("../models/User_Event_Join.model");
const { GroupError, GroupSuccess } = require("../utils/Constants/Group");
const otpGenerator = require("otp-generator");

const {RedisClient} = require("../service/configRedis");
const cacheData = require("../service/cacheData");
const moment = require('moment-timezone');
const { google } = require('googleapis');
const passport = require("passport");
const e = require("express");
const { EventError } = require("../utils/Constants/Event");

// give input should be trim
async function validateGroupNameInEvent(eventId, groupName) {

    const existSameNameGroupInEvent =
        await Group.findOne({ event: new mongoose.Types.ObjectId(eventId), name: groupName }).select("_id").lean();


    if (existSameNameGroupInEvent) {
        throw new ApiError(GroupError.SAME_GROUP_EXISTS);
    }
};

const validateCreatorOfEventNotJoinEvent = async (EventCreator, user) => {
    if (user._id.toString() === EventCreator.toString()) {
        throw new ApiError(GroupError.CREATOR_NOT_JOIN);
    }
};

async function validateUserJoinSameEventBefore(eventId, user) {
    const Key = `Event:Join:users:${eventId}`;
    if (await RedisClient.sismember(Key, user._id)) {
        throw new ApiError(GroupError.USER_ALREADY_JOIN);
    }

    // const FindAnyOneUserThatReadyJoinSameEvent = await User_Event_Join.findOne({ Event: eventId, Member: { $in: UserIds } }).select("_id").lean();
}

async function validateAllowBranch(allowBranch, user) {

    if (allowBranch == "all") {
        return;
    }

    if (!allowBranch.includes(user.branch)) {
        throw new ApiError(GroupError.MEMBER_BRANCH_INVALIED);
    }
}

const scanGroupQRCode = asyncHandler(async (req, res) => {
    let responseCode = 500;

    try {
        const groupId = req.params.groupId;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            responseCode = 404;
            throw new ApiError(GroupError.INVALID_GROUP);
        }

        const groupDatas = await cacheData.GetGroupDataById('$', groupId);
        if (groupDatas.length === 0) {
            responseCode = 403;
            throw new ApiError(GroupError.INVALID_GROUP);
        }

        const groupData = groupDatas[0];

        const eventDatas = await cacheData.GetEventDataById('$', groupData.event);
        if (eventData.length === 0) {
            responseCode = 404;
            throw new ApiError(GroupError.INVALID_EVENT);
        }

        const eventData = eventDatas[0];

        const currentTime = moment.tz(Date.now(), "Asia/Kolkata").toDate();
        if (eventData.startDate > currentTime || eventData.endDate < currentTime) {
            responseCode = 402;
            throw new ApiError(GroupError.EVENT_NOT_START);
        }

        if (req.user._id !== eventData.creator.toString()) {
            responseCode = 401;
            throw new ApiError(GroupError.INVALID_USER);
        }

        if (groupData.qrCodeScan) {
            responseCode = 400;
            throw new ApiError(GroupError.QR_ALREADY_SCAN);
        }

        await RedisClient.call("JSON.SET", `Group:FullData:${groupId}`, '$.qrCodeScan', true);
        await Group.findByIdAndUpdate(groupId, { qrCodeScan: true });

        const successRedirectURL = `..../scan-success?code=200&groupName=${encodeURIComponent(groupData.name)}`;
        return res.redirect(successRedirectURL);

    } catch (error) {
        if (error instanceof ApiError) {
            return res.redirect(`..../scan-error?code=${encodeURIComponent(responseCode)}`);
        }

        console.error('Unexpected error during QR code scanning:', error);
        return res.status(responseCode).send("An error occurred during QR code scanning.");
    }
});

const validateUser = async (eventId, userId) => {
    try {
        const events = await cacheData.GetEventDataById('$', eventId);

        if (events.length === 0) {
            throw new ApiError(GroupError.INVALID_EVENT);
        }

        const event = events[0];

        // if(event.groupLimit < event.joinGroup + 1){
        //     throw new ApiError(EventError.EVENT_FULL);
        // }

        const users = await cacheData.GetUserDataById('$', userId);

        if (users.length === 0) {
            throw new ApiError(GroupError.INVALID_USER);
        }
        const user = users[0];

        if (event.girlMinLimit > 0 && event.userLimit === 1 && user.gender === 'male') {
            throw new ApiError(GroupError.ONLY_GIRL_JOIN);
        }

        await Promise.all([
            validateCreatorOfEventNotJoinEvent(event.creator, user),
            validateAllowBranch(event.allowBranch, user),
            validateUserJoinSameEventBefore(event._id, user)
        ]);

        return user;
    } catch (error) {
        throw error;
    }
}

const codeGenerater = async () => {
    let count = 100000;
    let code;
    do {
        code = otpGenerator.generate(6, { upperCaseAlphabets: true, lowerCaseAlphabets: true, specialChars: false });
        count--;
    } while (await RedisClient.sismember('Group:Code', code) && count);

    if (count === 0) {
        throw new ApiError(GroupError.CODE_GENERATION_FAILED);
    }

    return code;
}

const LeaderCreateGroup = asyncHandler(async (req, res) => {
    const { name, event } = req.body;

    if (!name || !event) {
        throw new ApiError(GroupError.MISSING_FIELDS);
    }
    
    const session = await mongoose.startSession();

    const AllValidatePromise = [
        validateGroupNameInEvent(event, name),
        validateUser(event, req.user._id),
        codeGenerater()
    ];

    const [_, user, code] = await Promise.all(AllValidatePromise);
    try {
        session.startTransaction();

        const [group] = await Group.create([
            {
                name,
                groupLeader: user._id,
                code,
                event
            }
        ], { session });

        const userEventJoinPromise = User_Event_Join.create([
            {
                Event: event,
                Member: user._id
            }
        ], { session });

        const userGroupJoinPromise = User_Group_Join.create([
            {
                Group: group._id,
                Member: user._id
            }
        ], { session });

        const eventUpdatePromise = Event.updateOne(
            { _id: new mongoose.Types.ObjectId(event) },
            { $inc: { joinGroup: 1 } },
            { session }
        );

        await Promise.all([userEventJoinPromise, userGroupJoinPromise, eventUpdatePromise]);

        console.log(user.refershToken);

        if (user.isGoogleUser) {
            await SetCalender(event, user.accessToken);
        }

        const pipeline = RedisClient.pipeline();

        pipeline.sadd(`Event:Join:groups:${event}`, group._id);
        pipeline.sadd(`Event:Join:users:${event}`, user._id);
        pipeline.call('JSON.NUMINCRBY', `Event:FullData:${event}`, '$.joinGroup', 1);

        await Promise.all([
            pipeline.exec(),
            cacheData.cacheGroup(group),
            cacheData.cacheGroupJoinUser(
                {
                    _id: group._id,
                    event: event,
                    JoinUserId: user._id
                }
            )
        ]);

        const existGroup = await getGroupDetails(event, req.user._id);

        await session.commitTransaction();

        // console.log("Group Created", existGroup);

        return res.status(GroupSuccess.GROUP_CREATED.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_CREATED, existGroup));

    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) {
            throw error;
        } else if (error.name === "ValidationError") {
            throw new ApiError(GroupError.VALIDATION_ERROR, error.message);
        }
        console.log(error);
        throw new ApiError(GroupError.GROUP_CREATION_FAILED, error.message);
    } finally {
        session.endSession();
    }

});
const validateAvailableSpot = async (event, userId, code) => {

    const group = await Group.findOne({ code }).select("_id").lean();

    if (!group) {
        throw new ApiError(GroupError.INVALID_CODE);
    }

    const userGenderss = await cacheData.GetUserDataById('$.gender', userId);
    const userGender = userGenderss[0];

    const usersId = await RedisClient.smembers(`Group:Join:${group._id}`);
    const userGenders = await cacheData.GetUserDataById('$.gender', ...usersId);

    const eventDatas = await cacheData.GetEventDataById('$', event);
    const eventData = eventDatas[0];

    console.log(userGenders.length + 1, eventData.userLimit);

    if (userGenders.length + 1 > eventData.userLimit) {
        throw new ApiError(GroupError.GROUP_LIMIT_EXCEEDED);
    }

    const maleCount = userGenders.filter(gender => gender === 'male').length;

    const totalMaleCount = maleCount + (userGender === 'male' ? 1 : 0);

    const availableSpotForGirls = eventData.userLimit - totalMaleCount;

    if (availableSpotForGirls < eventData.girlMinLimit) {
        const missingGirls = eventData.girlMinLimit - availableSpotForGirls;
        throw new ApiError(GroupError.LESS_GIRL, { count: missingGirls });
    }
};
const UserJoinGroup = asyncHandler(async (req, res) => {
    const { code, event } = req.body;

    if (!code || !event) {
        throw new ApiError(GroupError.MISSING_FIELDS);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const [user] = await Promise.all([
        validateUser(event, req.user._id, session), 
        validateAvailableSpot(event, req.user._id, code, session)
    ]);

    try {

        const group = await Group.findOne({ code }).select("_id").lean().session(session);

        const userEventJoinPromise = User_Event_Join.create([{
            Event: event,
            Member: user._id
        }], { session });

        const userGroupJoinPromise = User_Group_Join.create([{
            Group: group._id,
            Member: user._id
        }], { session });

        await Promise.all([userEventJoinPromise, userGroupJoinPromise]);

        if (user.isGoogleUser) {
            await SetCalender(event, user.accessToken);
            console.log("Calendar Set");
        }

        await Promise.all([
            RedisClient.sadd(`Group:Join:${group._id}`, user._id), 
            RedisClient.sadd(`Event:Join:users:${event}`, user._id)
        ]);

        const existGroup = await getGroupDetails(event, user._id, session);

        await session.commitTransaction();

        return res.status(GroupSuccess.GROUP_JOIN_SUCCESS.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_JOIN_SUCCESS, existGroup));

    } catch (error) {
        await session.abortTransaction();

        if (error instanceof ApiError) {
            throw error;
        } else if (error.name === "ValidationError") {
            throw new ApiError(GroupError.VALIDATION_ERROR, error.message);
        }
        
        console.log(error);
        throw new ApiError(GroupError.GROUP_JOIN_FAILED, error.message);
    }finally{
        session.endSession();
    }
});

const getUserInGroup = asyncHandler(async (req, res) => {

    try {
        const groupId = req.params.id;

        const userIds = await RedisClient.smembers(`Group:Join:${groupId}`);

        const users = await cacheData.GetUserDataById('$', ...userIds);

        return res.status(GroupSuccess.GROUP_FOUND.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_FOUND, users));

    } catch (error) {
        console.log(error.message);
        throw new ApiError(GroupError.INVALID_GROUP, error.message);
    }

});

async function VerifiedGroup(eventId , groupId) {
    
}

async function getGroupDetails(eventId, userId) {

    const existGroup = await RedisClient.sismember(`Event:Join:users:${eventId}`, userId);

    if (!existGroup) {
        return null;
    }
    const groupId = await RedisClient.smembers(`Event:Join:groups:${eventId}`);
    let group = null;
    for (const id of groupId) {
        const existUser = await RedisClient.sismember(`Group:Join:${id}`, userId);
        if (existUser) {
            const groups = await cacheData.GetGroupDataById('$', id);
            group = groups[0];
            break;
        }
    }

    const leaderNames = await cacheData.GetUserDataById('$.name', group.groupLeader);
    const leaderName = leaderNames[0];
    const usersId = await RedisClient.smembers(`Group:Join:${group._id}`);

    let users = await cacheData.GetUserDataById('$.name', ...usersId);

    const userNameWithoutLeader = users.filter(user => user.name !== leaderName).map(user => user.name);

    userName = [leaderName, ...userNameWithoutLeader];

    const CanGroupVerified = await VerifiedGroup();

    return {
        name: group.name,
        code: group.code,
        usersName: userName,
        isVerified: CanGroupVerified
    };
};
async function SetCalender(eventId, accessToken) {
    try {
        const eventdetails = await cacheData.GetEventDataById("$", eventId);
        const eventdetail = eventdetails[0];

        console.log(eventdetail);

        const oauth2Client = new google.auth.OAuth2();

        oauth2Client.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3' });
        console.log("Google Calendar Connected");
        const eventcreation = {
            summary: eventdetail.name,
            description: eventdetail.description,
            start: { dateTime: eventdetail.startDate, timeZone: 'UTC' },
            end: { dateTime: eventdetail.endDate, timeZone: 'UTC' },
        };

        const response = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: "primary",
            resource: eventcreation,
        });
        // console.log("Google Calendar Event Created:", response.data);
        console.log("Google Calendar Event Created:", response.data);
    } catch (error) {
        console.error("Error creating event in Google Calendar:", error);
    }
}

module.exports = {
    // createGroup,
    // pending roll back cache data in create group and join group
    LeaderCreateGroup,
    UserJoinGroup,
    getGroupDetails,
    getUserInGroup,

    // change frontendurl
    scanGroupQRCode
};