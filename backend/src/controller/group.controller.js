const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const Event = require("../models/event.model");
const User_Group_Join = require("../models/User_Group_Join.model");
const { GroupError, GroupSuccess } = require("../utils/Constants/Group");


// give input should be trim
async function validateGroupNameInEvent(eventId, groupName) {

    const existSameNameGroupInEvent = await Group.find({ event: new mongoose.Types.ObjectId(eventId), name: groupName });

    if (existSameNameGroupInEvent.length > 0) {
        throw new ApiError(GroupError.SAME_GROUP_EXSIST);
    }
};

// this not use only for testing purpose 
// check event is full or not give user limit and time limit so this function is not used
// const validateGroupSize = asyncHandler(async (req, res) => {
//     const { eventId, groupSize } = req.body;
//     if (!groupSize) {
//         throw new ApiError(GroupError.MISSING_GROUP_SIZE);
//     }

//     const event = await Event.findById(eventId).select("userLimit");

//     if (!event || !event.userLimit) {
//         throw new ApiError(GroupError.INVALID_EVENT);
//     }
//     if (event.userLimit < groupSize) {
//         throw new ApiError(GroupError.GROUP_LIMIT_EXCEEDED);
//     }

//     return res
//         .status(GroupSuccess.GROUP_SIZE_VALIDATED.statusCode)
//         .json(new ApiResponse(GroupSuccess.GROUP_SIZE_VALIDATED));
// });

//give input tolower and trim
//not duplicate
async function validateMemberRole(eventId, MemeberEmails) {

    const allowedRoles = ["user", "org"];

    const users = await User.find({ email: { $in: MemeberEmails }, role: { $in: allowedRoles } }).select("_id email role");

    if (MemeberEmails.length !== users.length) {
        const foundEmails = users.map((u) => u.email);
        const missingEmails = MemeberEmails.filter((email) => !foundEmails.includes(email));
        throw new ApiError(GroupError.INVALID_MEMBER_ROLE, missingEmails);
    }

    const OrgUser = users
            .filter(user => user.role == allowedRoles[1])
            .map(user => user._id);

    const NotallowOrg = await Event.find({ _id: new mongoose.Types.ObjectId(eventId), creator: { $in: OrgUser } });

    if (NotallowOrg.length > 0) {
        throw new ApiError(GroupError.ORG_INVALIED);
    }

    return users.map((u) => u._id);
};

// Leader is Validate
async function validateGroupLeader(groupLeaderEmail) {

    return await User.findOne({ email: groupLeaderEmail }).select("_id").lean();

    // const allowedRoles = ["user", "org"];
    // const user = await User.aggregate({ email: groupLeaderEmail , role: { $in: allowedRoles } }).select("_id email role");
    // if (!user) {
    //     throw new ApiError(GroupError.INVALID_GROUP_LEADER);
    // }
    // if(user.role != allowedRoles[1]){
    //     return user._id;
    // }
    // const NotallowOrg = await Event.exsist({_id:new mongoose.Types.ObjectId(eventId),creator: user._id});
    // if (NotallowOrg) {
    //     throw new ApiError(GroupError.ORG_INVALIED);
    // }
    // return user._id;
};

//give input tolower and trim
const createGroup = asyncHandler(async (req, res) => {

    // event is the event ID

    const { name, groupLeader, event, validMemberEmail, timeLimit } = req.body;

    if (!name || !groupLeader || !event || !validMemberEmail || !timeLimit || !Array.isArray(validMemberEmail) || validMemberEmail.length === 0) {
        throw new ApiError(GroupError.MISSING_FIELDS);
    }
    console.log("hello");
    await validateGroupNameInEvent(event, name);
    console.log("hello");
    const validMemberId = await validateMemberRole(event, validMemberEmail);
    console.log("hello");
    const validatedLeader = await validateGroupLeader(groupLeader);
    console.log("hello");
    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const group = await Group.create({
            name,
            groupLeader: validatedLeader,
            event,
            timeLimit
        });

        const userGroupJoinOperations = validMemberId.map(member => ({
            insertOne: {
                document: {
                    Group: group._id,
                    Member: member,
                    timeLimit
                }
            }
        }));

        await User_Group_Join.bulkWrite(userGroupJoinOperations, { session });

        await Event.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(event) }, { $inc: { joinGroup: 1 } });

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