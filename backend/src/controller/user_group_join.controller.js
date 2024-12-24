const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const User_Group_Join = require("../models/User_Group_Join.model");
const User = require("../models/user.model");

exports.GetUserJoinGroups = async (userId) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    if(await User.findById(userId).select("_id") === null){
        throw new ApiError(404, "User not found");
    }
    
    const pipeline = [
        {
            $match: { Member: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "groups",
                localField: "Group",
                foreignField: "_id",
                as: "groupDetails"
            }
        },
        {
            $replaceRoot: {
                newRoot: {
                    $arrayElemAt: ["$groupDetails", 0]
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                score: 1,
                groupLeader: 1
            }
        }
    ];

    try {
        const groups = await User_Group_Join.aggregate(pipeline);
        return groups;
    } catch (error) {
        throw new ApiError(500, "An error occurred while fetching the groups" + error);
    }
};

exports.getUserJoinEvents = async (userId) => {

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID");
    }

    if(await User.findById(userId).select("_id") === null){
        throw new ApiError(404, "User not found");
    }
    const pipeline = [
        {
            $match: { Member: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "groups",
                localField: "Group",
                foreignField: "_id",
                as: "groupDetails"
            }
        },
        {
            $group: {
                _id: "$groupDetails.event",
                groupDetails: { $first: "$groupDetails" }
            }
        },
        {
            $lookup: {
                from: "events",
                localField: "_id",
                foreignField: "_id",
                as: "eventDetails"
            }
        },
        {
            $replaceRoot: {
                newRoot: {
                    $arrayElemAt: ["$eventDetails", 0]
                }
            }
        },
        {
            $project: {
                _id: 1,
                avatar: 1,
                name: 1,
                category: 1,
                location: 1,
                startDate: 1,
                endDate: 1,
                pricePool: 1
            }
        }
    ];

    try {
        const events = await User_Group_Join.aggregate(pipeline);
        return events;
    } catch (error) {
        throw new ApiError(500, "An error occurred while fetching the events" + error);
    }
};

exports.getUserGroups = asyncHandler(async (req, res) => {
    const {userId} = req.body;
    const data = await this.GetUserJoinGroups(userId);
    return res.status(200).json(new ApiResponse(200, data, "User Groups Retrieved Successfully"));
});

exports.getUserEvents = asyncHandler(async (req, res) => {
    const {userId} = req.body;
    const data = await this.getUserJoinEvents(userId);
    return res.status(200).json(new ApiResponse(200, data, "User Events Retrieved Successfully"));
});