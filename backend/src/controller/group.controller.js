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
const UserController = require("./user.controller")

const RedisClient = require("../service/configRedis");
const cacheData = require("../service/cacheData");

// give input should be trim
async function validateGroupNameInEvent(eventId, groupName) {

    const existSameNameGroupInEvent =
        await Group.findOne({ event: new mongoose.Types.ObjectId(eventId), name: groupName }).select("_id").lean();

    if (existSameNameGroupInEvent) {
        throw new ApiError(GroupError.SAME_GROUP_EXSIST);
    }
};

async function validateCreaterOfEventNotJoinEvent(EventCreater, users, role) {
    const OrgUser = users
        .filter(user => user.role == role)
        .map(user => user._id);

    // const NotallowOrg = await Event.findOne({ _id: new mongoose.Types.ObjectId(eventId), creater: { $in: OrgUser } }).select("_id").lean();

    if (OrgUser.includes(EventCreater)) {
        throw new ApiError(GroupError.ORG_INVALIED);
    }
}

async function validateUserJoinSameEventBefore(eventId, users) {
    const Key = `Event:Join:users:${eventId}`;

    for (const user of users) {
        if (await RedisClient.sismember(Key, user._id)) {
            throw new ApiError(GroupError.USER_ALREADY_JOIN);
        }
    }
    // const FindAnyOneUserThatReadyJoinSameEvent = await User_Event_Join.findOne({ Event: eventId, Member: { $in: UserIds } }).select("_id").lean();
}

async function validateAllowBranch(users, allowBranch) {
    const userBranch = users.map(u => u.branch);

    if (allowBranch == "all") {
        return;
    }

    if (!userBranch.every(branch => allowBranch.includes(branch))) {
        throw new ApiError(GroupError.MEMBER_BRANCH_INVALIED);
    }

}

async function validateGirlCount(minGirlCount, users) {

    const groupGirlCount = users.reduce((count, user) => {
        return user.gender === 'female' ? count + 1 : count;
    }, 0);

    if (groupGirlCount < minGirlCount) {
        throw new ApiError(GroupError.LESS_GIRL);
    }
}

async function validateUserLimit(userCount, Limit) {
    if (userCount > Limit) {
        throw new ApiError(GroupError.GROUP_LIMIT_EXCEEDED);
    }
}

async function validateMemberRole(eventId, MemeberEmails) {
    const allowedRoles = User.allowedRoles;

    const eventSTR = await RedisClient.call('JSON.GET', `Event:FullData:${eventId}`, '$');
    const event = JSON.parse(eventSTR)[0];
    const users = await cacheData.GetUserDataFromEmail(...MemeberEmails);

    if (users.length !== MemeberEmails.length) {
        throw new ApiError(GroupError.INVALID_MEMBER_EMAIL)
    }

    const validationPromises = [
        validateCreaterOfEventNotJoinEvent(event.creater, users, allowedRoles[1]),
        validateAllowBranch(users, event.allowBranch),
        validateGirlCount(event.minGirlCount, users),
        validateUserLimit(users.length, event.userLimit),
        validateUserJoinSameEventBefore(eventId, users)
    ];

    await Promise.all(validationPromises);

    return users.map((u) => u._id);
}

// Leader is Validate
async function validateGroupLeader(groupLeaderEmail, validMemberEmail) {

    if (validMemberEmail.includes(groupLeaderEmail))
        return await User.findOne({ email: groupLeaderEmail }).select("_id").lean();

    throw new ApiError(GroupError.TRY_TO_CHANGE_REQ_BODY);

};

//give input tolower and trim
const createGroup = asyncHandler(async (req, res) => {

    // event is the event ID

    const { name, groupLeader, event, validMemberEmail, timeLimit } = req.body;

    if (!name || !groupLeader || !event || !validMemberEmail || !timeLimit || !Array.isArray(validMemberEmail) || validMemberEmail.length === 0) {
        throw new ApiError(GroupError.MISSING_FIELDS);
    }

    const AllValidatePromise = [
        validateGroupNameInEvent(event, name),
        validateMemberRole(event, validMemberEmail),
        validateGroupLeader(groupLeader, validMemberEmail),
    ];

    const [_, validMemberId, validatedLeader] = await Promise.all(AllValidatePromise);

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const groupArray = await Group.create([{
            name,
            groupLeader: validatedLeader,
            event,
            timeLimit
        }], { session });

        const group = groupArray[0];

        const userGroupJoinDocuments = validMemberId.map(member => ({
            Group: group._id,
            Member: member,
            timeLimit
        }));

        const userEventJoinDocuments = validMemberId.map(member => ({
            Event: event,
            Member: member,
            timeLimit
        }));

        // Perform insertMany for both collections in parallel
        await Promise.all([
            User_Group_Join.insertMany(userGroupJoinDocuments, { session }),
            User_Event_Join.insertMany(userEventJoinDocuments, { session })
        ]);

        // Increment joinGroup in Event
        const count = await Event.findByIdAndUpdate(
            { _id: new mongoose.Types.ObjectId(event) },
            { $inc: { joinGroup: 1 } },
            { session, new: true }
        );

        const pipeline = RedisClient.pipeline();
        pipeline.sadd(`Event:Join:groups:${event}`, group._id);
        pipeline.sadd(`Event:Join:users:${event}`, ...validMemberId);
        pipeline.call('JSON.SET', `Event:FullData:${event}`, '$.joinGroup', count.joinGroup);
        await pipeline.exec();
        cacheData.cacheGroupJoinUser(
            {
                id: group._id,
                event: event,
                JoinUserId: validMemberId
            }
        );
        cacheData.cacheGroup(group);

        await session.commitTransaction();

        return res
            .status(GroupSuccess.GROUP_CREATED.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_CREATED, { id: group._id }));

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



module.exports = {
    createGroup
};