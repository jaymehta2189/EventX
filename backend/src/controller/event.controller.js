const Event = require("../models/event.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

exports.findAllEventsByOrgId = async function(orgId) {
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
        throw new Error("Invalid Organization ID");
    }

    const events = await Event.find({ creator: orgId });

    return events;
};


// const mongoose = require("mongoose");
// const Event = require("./Event"); // Adjust based on your file structure
// const Group = require("./Group");
// const User_Group_Join = require("./User_Group_Join");
// async function findEventsForUser(userId) {
//     try {
//         // Ensure the provided ID is valid
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             throw new Error("Invalid User ID");
//         }

//         // Step 1: Find all groups the user has joined
//         const userGroups = await User_Group_Join.find({ Member: userId }).select("Group");
//         const groupIds = userGroups.map((ugj) => ugj.Group);

//         // Step 2: Find all events related to these groups
//         const groups = await Group.find({ _id: { $in: groupIds } }).select("event");
//         const eventIds = groups.map((group) => group.event);

//         // Step 3: Retrieve events
//         const events = await Event.find({ _id: { $in: eventIds } });

//         console.log("Events the user has joined:", events);
//         return events;
//     } catch (error) {
//         console.error("Error finding events for user:", error.message);
//         throw error;
//     }
// }




