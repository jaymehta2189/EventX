const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const Group = require("../models/group.model");
const User = require("../models/user.model");
const Event = require("../models/event.model");
const User_Group_Join = require("../models/User_Group_Join.model");
const { GroupError, GroupSuccess } = require("../utils/Constants/Group");
const { google } = require('googleapis');
// const oauth2Client = require('../utils/google');
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
    console.log(groupGirlCount, minGirlCount)
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
                let: { eventId: new mongoose.Types.ObjectId(eventId) }, // Pass the eventId
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$eventId"] } } }, // Match using the variable
                    { $project: { allowBranch: 1, girlMinLimit: 1, userLimit: 1 } }, // Select specific fields
                ],
                as: "eventDetails",
            },
        },
        {
            $addFields: {
                eventDetails: { $arrayElemAt: ["$eventDetails", 0] }, // Flatten the eventDetails array
            },
        },
    ]).exec();



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
       // validateCreatorOrgNotJoinEvent(eventId, users, allowedRoles[1]),
        validateAllowBranch(users, event.allowBranch),
        validateGirlCount(users, event.girlMinLimit),
        validateUserLimit(users.length, event.userLimit)
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

    const { name, groupLeader, event, validMemberEmail } = req.body;
    const timeLimit = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000);
    if (!name || !groupLeader || !event || !validMemberEmail  || !Array.isArray(validMemberEmail) || validMemberEmail.length === 0) {
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

        // Increment joinGroup in Event
        await Event.findByIdAndUpdate(
            { _id: new mongoose.Types.ObjectId(event) },
            { $inc: { joinGroup: 1 } },
            { session }
        );
        console.log("asasa")
        //calender
        try {
            const eventdetail = await Event.findOne({ _id: new mongoose.Types.ObjectId(event) }).select("startDate endDate name description").lean();
           console.log(req.user);
            const  accessToken  = req.user.accessToken;
            console.log(accessToken);
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const eventcreation = {
                summary: eventdetail.name,
                description: eventdetail.description,
                start: { dateTime: eventdetail.startDate, timeZone: 'UTC' },
                end: { dateTime: eventdetail.endDate, timeZone: 'UTC' },
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: eventcreation,
            });

            console.log("Google Calendar Event Created:", response.data);
        } catch (error) {
            console.error("Error creating event in Google Calendar:", error);
            res.status(500).json({ message: 'Error creating event', error: error.message });
        }
       // calender



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