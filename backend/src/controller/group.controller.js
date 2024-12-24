const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const UserController = require("./user.controller");
const User_Group_Join = require("../models/User_Group_Join.model");
const { generateQRAndSaveAtCloudinary } = require("../utils/generateQR");

exports.validateGroupNameInEvent = async(eventId, groupName) => {
   
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Please provide valid Event ID");
    }

    if (!groupName || typeof groupName !== "string") {
        throw new ApiError(400, "Please provide a valid group name");
    }

    const existSameNameGroupInEvent = await Group.findOne({event:eventId,name:groupName}).select("name");

    if (existSameNameGroupInEvent) {
        throw new ApiError(400, `Group with name ${groupName} already exists for the event`);
    }
};

exports.createGroup = asyncHandler(async (req, res) => {
    // event is the event ID
    const { name, groupLeaderEmailId, event, MemberEmailIds } = req.body;

    const groupLeader = await UserController.getUserByEmail({ email: groupLeaderEmailId ,fields:"_id"});
    
    await this.validateGroupNameInEvent(event, name);

    const validMemberEmails = await UserController.getUsersByEmails({ emails:MemberEmailIds , fields:"_id"});

    try {

        // const Qr = await generateQRAndSaveAtCloudinary(`http://localhost:${process.env.PORT}/api/group/${groupLeader._id}/${event}`);
        const group = await Group.create({
            name,
            groupLeader: groupLeader._id,
            event
        });

        if (!group) {
            throw new ApiError(500, "Group creation failed");
        }

        const userGroupJoinPromises = validMemberEmails.map(async (member) => {
            return User_Group_Join.create({
                Group: group._id,
                Member: member._id
            });
        });

        await Promise.all(userGroupJoinPromises);

        return res.status(201).json(new ApiResponse(201, { id: group._id }, "Group Created Successfully"));

    } catch (error) {
        throw new ApiError(500, error.message);
    }
});