const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const OTP = require("../models/otp.model");
const otpGenerator = require("otp-generator");

// exports.signupPost = asyncHandler(async (req, res) => {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//         throw new ApiError(400, "Please provide all the details");
//     }
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//         throw new ApiError(400, "User already exists with this email.");
//     }
//     console.log(name);
//     const user = await User.create({
//         name,
//         email,
//         password
//     });
//     if (!user) {
//         throw new ApiError(400, "Invalid User Data");
//     }
//     console.log(user);
//     console.log("user Created");
//     return res.status(201).json(new ApiResponse(201, { Name: name, Email: email, avatar: avatar } = user, "User Created"));
// }
// );

exports.signinPost = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);

        return res.status(200).cookie("token", token).json(new ApiResponse(200, { token }, "User Logged In"));
    } catch (error) {

        throw new ApiError(400, error.message);
    }
});

exports.logout = asyncHandler((req, res) => {
    return res.status(200).clearCookie("token").json(new ApiResponse(200, {}, "User Logged Out"));
});

exports.sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
        throw new ApiError(401, "User is Already Registered");
    }
    let otp;
    do {
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    } while (await OTP.findOne({ otp }));

    await OTP.create({ email, otp });

    return res.status(200).json(new ApiResponse(200, { email, otp }, "OTP Sent Successfully"));
});

exports.signupPost = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        otp,
    } = req.body;

    // Check if All Details are there or not
    if (!name || !email || !password || !otp) {
        throw new ApiError(400, "Please provide all the details");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email.");
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(response);
    if (response.length === 0 || otp !== response[0].otp) {
        throw new ApiError(400, "The OTP is not valid");
    }

    const user = await User.create({
        name,
        email,
        password
    });

    if (!user) {
        throw new ApiError(400, "Invalid User Data");
    }

    return res.status(201).json(new ApiResponse(201, {email,name}, "User Created"));
});

