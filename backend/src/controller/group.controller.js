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

exports.validateGroupNameInEvent = async (eventId, groupName) => {

    if (!groupName || typeof groupName !== "string") {
        throw new ApiError(400, "Please provide a valid group name");
    }

    const existSameNameGroupInEvent = await Group.aggregate([
        { $match: { event: new mongoose.Types.ObjectId(eventId), name: groupName.trim() } },
        { $project: { name: 1 } }
    ]).exec();

    if (existSameNameGroupInEvent.length > 0) {
        throw new ApiError(400, `Group with name ${groupName} already exists for the event`);
    }
};

exports.createGroup = asyncHandler(async (req, res) => {
    
    // event is the event ID

    const { name, groupLeaderEmailId, event, MemberEmailIds } = req.body;
    if(req.user.role !== "user"){
        throw new ApiError(403, "You are not authorized to create a group");
    }
    if (!event || !mongoose.Types.ObjectId.isValid(event)) {
        throw new ApiError(400, "Please provide valid Event ID");
    }

    const EventTimeLimit = await Event.findById(event).select("timeLimit");

    if (!EventTimeLimit) {
        throw new ApiError(404, "Event not found");
    }

    const groupLeader = await UserController.getUserByEmail({ email: groupLeaderEmailId, fields: "_id role" });
    if(groupLeader.role !== "user"){throw new ApiError(400, "Group Leader must be a user");}
    await this.validateGroupNameInEvent(event, name);

    const validMemberEmails = await UserController.getUsersByEmails({ emails: MemberEmailIds, fields: "_id role" });
    for (const member of validMemberEmails) {
        if (member.role !== "user") {
            throw new ApiError(400, "Group Member must be a user");
        }
    }
    const session = await mongoose.startSession();
    
    session.startTransaction();

    try {

        const timeLimit = EventTimeLimit.timeLimit;
        const group = await Group.create({
            name,
            groupLeader: groupLeader._id,
            event,
            timeLimit
        });

        if (!group) {
            throw new ApiError(500, "Group creation failed");
        }

        const userGroupJoinOperations = validMemberEmails.map(member => ({
            insertOne: {
                document: {
                    Group: group._id,
                    Member: member._id,
                    timeLimit
                }
            }
        }));

        await User_Group_Join.bulkWrite(userGroupJoinOperations);

        await session.commitTransaction();
        return res.status(201).json(new ApiResponse(201, { id: group._id }, "Group Created Successfully"));

    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, error.message);
    } finally {
        session.endSession();

    }
});