// const ApiError = require("../utils/ApiError");
// const ApiResponse = require("../utils/ApiResponse");
// const asyncHandler = require("../utils/asyncHandler");
// const mongoose = require("mongoose");
// const Org = require("../models/org.model");
// // const Group = require("../models/group.model");
// // const User = require("../models/user.model");
// // const User_Group_Join = require("../models/User_Group_Join.model");

// exports.validateOrgId = async ({orgId , fields = null}) => {
//     if (!mongoose.Types.ObjectId.isValid(orgId)) {
//         throw new ApiError(400, "Invalid Organization ID");
//     }
//     const org = await Org.findById(orgId).select(fields);
//     if (!org) {
//         throw new ApiError(404, "Organization not found");
//     }
//     return org;
// };

// exports.createOrg = asyncHandler(async (req, res) => {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//         throw new ApiError(400, "Please provide all the details");
//     }
//     try{
//         const org = await Org.create({
//             name,
//             email,
//             password
//         });
        
//         return res.status(201).json(new ApiResponse(201, org, "Organization Created"));
//     }catch(error){
//         if (error.name === "ValidationError") {
//             throw new ApiError(400, error.message); // Catch validation errors
//         }
//         throw new ApiError(500, "An error occurred while creating the organization"); // Catch other errors
//     }
// });