const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const Event = require("../models/event.model");
const UserController = require("./user.controller");
const User_Group_Join = require("../models/User_Group_Join.model");
const { generateQRAndSaveAtCloudinary } = require("../utils/generateQR");
const { GroupError ,GroupSuccess} = require("../utils/Constants/Group");


// give input should be trim
const validateGroupNameInEvent = asyncHandler(async (req, res) => {
    const {eventId, groupName} = req.body;
    if (!groupName) {
        throw new ApiError(GroupError.MISSING_GROUP_NAME);
    }

    const existSameNameGroupInEvent = await Group.aggregate([
        { $match: { event: new mongoose.Types.ObjectId(eventId), name: groupName.trim() } },
        { $count: "count" }
    ]).exec();

    if (existSameNameGroupInEvent.length > 0 && existSameNameGroupInEvent[0].count > 0) {
        throw new ApiError(GroupError.SAME_GROUP_EXSIST);
    }

    return res
            .status(GroupSuccess.GROUP_NAME_VALIDATED.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_NAME_VALIDATED));
});

// this not use only for testing purpose 
// check event is full or not give user limit and time limit so this function is not used
const validateGroupSize = asyncHandler(async (req, res) => {
    const { eventId, groupSize } = req.body;
    if (!groupSize) {
        throw new ApiError(GroupError.MISSING_GROUP_SIZE);
    }

    const event = await Event.findById(eventId).select("userLimit");

    if (!event || !event.userLimit) {
        throw new ApiError(GroupError.INVALID_EVENT);
    }
    if (event.userLimit < groupSize) {
        throw new ApiError(GroupError.GROUP_LIMIT_EXCEEDED);
    }

    return res
            .status(GroupSuccess.GROUP_SIZE_VALIDATED.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_SIZE_VALIDATED));
});

//give input tolower and trim
//not duplicate
const validateMemberRole = asyncHandler(async (req, res) => {
    const { MemeberEmails  } = req.body;

    if (!MemeberEmails || !Array.isArray(MemeberEmails) || MemeberEmails.length === 0) {
        throw new ApiError(GroupError.MISSING_MEMBER_EMAIL);
    }

    const users = await User.find({ email: { $in: MemeberEmails }, role: User.allowedRoles[0] }).select("_id email");

    if (MemeberEmails.length !== users.length) {
        const foundEmails = users.map((u) => u.email);
        const missingEmails = MemeberEmails.filter((email) => !foundEmails.includes(email));
        throw new ApiError(GroupError.INVALID_MEMBER_ROLE, missingEmails);
    }

    return res
            .status(GroupSuccess.MEMBER_ROLE_VALIDATED.statusCode)
            .json(new ApiResponse(GroupSuccess.MEMBER_ROLE_VALIDATED, users.map((u) => u._id)));
});

//give input tolower and trim
const validateGroupLeader = asyncHandler(async (req, res) => {
    const { groupLeaderEmail } = req.body;

    if (!groupLeaderEmail) {
        throw new ApiError(GroupError.MISSING_GROUP_LEADER_EMAIL);
    }
    
    const user = await User.findOne({ email:groupLeaderEmail , role: User.allowedRoles[0] }).select("_id");

    if (!user) {
        throw new ApiError(GroupError.INVALID_GROUP_LEADER);
    }

    return res
            .status(GroupSuccess.GROUP_LEADER_VALIDATED.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_LEADER_VALIDATED,user._id));
});

//give input tolower and trim
const createGroup = asyncHandler(async (req, res) => {
    
    // event is the event ID

    const { name, groupLeader, event, validMemberId , timeLimit } = req.body;
    
    const allowedRoles = User.allowedRoles;

    if(req.user.role !== allowedRoles[0]){
        throw new ApiError(GroupError.INVALID_MEMBER_ROLE);
    }

    if(!name || !groupLeader || !event || !validMemberId || !timeLimit){
        throw new ApiError(GroupError.MISSING_FIELDS);
    }

    if (!Array.isArray(validMemberId) || validMemberId.length === 0) {
        throw new ApiError(GroupError.MISSING_FIELDS);
    }

    const session = await mongoose.startSession();
    
    session.startTransaction();

    try {

        const group = await Group.create({
            name,
            groupLeader,
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

        await User_Group_Join.bulkWrite(userGroupJoinOperations , {session});

        await session.commitTransaction();
        return res
            .status(GroupSuccess.GROUP_CREATED.statusCode)
            .json(new ApiResponse(GroupSuccess.GROUP_CREATED, {id:group._id}));

    } catch (error) {
        await session.abortTransaction();
        if(error instanceof ApiError){
            throw error;
        }else if(error.name === "ValidationError"){
            throw new ApiError(GroupError.VALIDATION_ERROR, error.message);
        }
        console.log(error);
        throw new ApiError(GroupError.GROUP_CREATION_FAILED,error.message);
    } finally {
        session.endSession();
    }
});

module.exports = {
    validateGroupNameInEvent,
    validateGroupLeader,
    validateGroupSize,
    validateMemberRole,
    createGroup
};