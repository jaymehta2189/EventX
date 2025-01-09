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

    const existSameNameGroupInEvent = await Group.findOne({ event: new mongoose.Types.ObjectId(eventId), name: groupName }).select("_id").lean();

    if (existSameNameGroupInEvent) {
        throw new ApiError(GroupError.SAME_GROUP_EXSIST);
    }
};

async function validateCreatorOrgNotJoinEvent(eventId, users, role) {
    const OrgUser = users
        .filter(user => user.role == role)
        .map(user => user._id);

    const NotallowOrg = await Event.findOne({ _id: new mongoose.Types.ObjectId(eventId), creator: { $in: OrgUser } }).select("_id").lean();

    if (NotallowOrg) {
        throw new ApiError(GroupError.ORG_INVALIED);
    }
}

async function validateAllowBranch(users, allowBranch) {
    const userBranch = users.map(u => u.branch);

    if (!userBranch.every(branch => allowBranch.includes(branch))) {
        throw new ApiError(GroupError.MEMBER_BRANCH_INVALIED);
    }
}

async function validateGirlCount(users, minGirlCount) {
    const groupGirlCount = users.reduce((count, user) => {
        return user.gender === 'female' ? count + 1 : count;
    }, 0);
    if (groupGirlCount < minGirlCount) {
        throw new ApiError(GroupError.LESS_GIRL);
    }
}

async function validateMemberRole(eventId, MemeberEmails) {
    const allowedRoles = User.allowedRoles;

    console.log(allowedRoles);

    const data = await User.aggregate([
        {
            $match: {
                email: { $in: MemeberEmails },
                role: { $in: allowedRoles },
            },
        },
        {
            $lookup: {
                from: "events", // Replace with the actual Event collection name
                localField: null, // No direct relationship between User and Event
                foreignField: "_id",
                as: "eventDetails",
                pipeline: [
                    { $match: { _id: new mongoose.Types.ObjectId(eventId) } },
                    { $project: { allowBranch: 1, girlMinLimit: 1 } },
                ],
            },
        },
        {
            $addFields: {
                eventDetails: { $arrayElemAt: ["$eventDetails", 0] },
            },
        },
    ]).lean();


    if (data.length === 0 || !data[0].eventDetails) {
        throw new ApiError(GroupError.INVALID_EVENT);
    }

    const users = data.map((item) => ({
        _id: item._id,
        email: item.email,
        role: item.role,
        branch: item.branch,
        gender: item.gender,
    }));

    const event = data[0].eventDetails;

    const validationPromises = [
        validateCreatorOrgNotJoinEvent(eventId, users, allowedRoles[1]),
        validateAllowBranch(users, event.allowBranch),
        validateGirlCount(users, event.girlMinLimit),
    ];

    await Promise.all(validationPromises);

    return users.map((u) => u._id);
}


// Leader is Validate
async function validateGroupLeader(groupLeaderEmail, validMemberEmail) {
    if (validMemberEmail.include(groupLeaderEmail))
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

        const group = await Group.collection.insertOne({
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

        await Promise.all([
            User_Group_Join.bulkWrite(userGroupJoinOperations, { session }),
            Event.findByIdAndUpdate(
                { _id: new mongoose.Types.ObjectId(event) },
                { $inc: { joinGroup: 1 } },
                { session }
            ),
        ]);

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