const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const OTP = require("../models/otp.model");
const otpGenerator = require("otp-generator");
const Group = require("../models/group.model.js");

const { UserError, UserSuccess } = require("../utils/Constants/User.js");

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

// input email should be tolower and trim
const validateEmail = asyncHandler(async (req, res) => {

    const {email} = req.body;

    if (!email) {
        throw new ApiError(UserError.MISSING_EMAIL);
    }

    if(!User.emailPattern.test(email)){
        throw new ApiError(UserError.INVALID_EMAIL);
    }

    const user = await User.findOne({ email }).select("_id");

    if(user){
        throw new ApiError(UserError.USER_ALREADY_EXISTS);
    }

    return  res
            .status(UserSuccess.EMAIL_VALIDATED.statusCode)
            .json(new ApiResponse(UserSuccess.EMAIL_VALIDATED));
});

// input role should be tolower and trim
const validateRole = asyncHandler(async (req, res) => {
    const {role}  = req.body;
    if (!role) {
        throw new ApiError(UserError.MISSING_ROLE);
    }
    if(!User.allowedRoles.includes(role.toLowerCase().trim())){
        throw new ApiError(UserError.INVALID_ROLE,role);
    }
    return res
            .status(UserSuccess.ROLE_VALIDATED.statusCode)
            .json(new ApiResponse(UserSuccess.ROLE_VALIDATED));
});

const validatePassword = asyncHandler(async (req, res) => {
    const {password} = req.body;
    if (!password) {
        throw new ApiError(UserError.MISSING_PASSWORD);
    }
    if(password.length<8){
        throw new ApiError(UserError.INVALID_PASSWORD);
    }
    return res
            .status(UserSuccess.PASSWORD_VALIDATED.statusCode)
            .json(new ApiResponse(UserSuccess.PASSWORD_VALIDATED));
});

// input shoble trim or lowercase
const verifyOTP = async function (email, otp) {
    
    if (!email || !otp) {
        throw new ApiError(UserError.MISSING_FIELDS);
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0 || otp !== response[0].otp) {
        throw new ApiError(UserError.INVALID_OTP);
    }
};

// call this function
// input emails should be tolower and trim
const getUsersByEmails = async ({ emails, fields = null }) => {

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        throw new ApiError(UserError.INVALID_EMAIL);
    }

    const users = await User.find({ email: { $in: emails } }).select(fields);

    console.log(users);

    if (users.length !== emailtrim.length) {
        const foundEmails = users.map((u) => u.email);
        const missingEmails = emailtrim.filter((email) => !foundEmails.includes(email));
        throw new ApiError(UserError.USER_NOT_FOUND, missingEmails);
    }

    return users;
};

// call this function
// input email should be tolower and trim
const getUserByEmail = async ({ email, fields = null }) => {

    if (!email || typeof email !== "string") {
        throw new ApiError(UserError.INVALID_EMAIL);
    }
    const user = await User.findOne({ email }).select(fields);

    if (!user) {
        throw new ApiError(UserError.USER_NOT_FOUND, email);
    }
    return user;
};

// email is trim or lowerCase
const signinPost = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);

        return res
            .status(UserSuccess.LOG_IN.statusCode)
            .cookie("token", token)
            .json(new ApiResponse(UserSuccess.LOG_IN,token));
            
    } catch (error) {
        if(error instanceof ApiError){
            throw error;
        }
        console.log(error);
        throw new ApiError(UserError.COOKIE_NOT_AVAILABLE,error.message);
    }
});

const logout = asyncHandler((req, res) => {
    return res
        .status(UserSuccess.LOG_OUT.statusCode)
        .clearCookie("token")
        .json(new ApiResponse(UserSuccess.LOG_OUT));
});

// input email should be tolower and trim
const sendOTP = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
        throw new ApiError(UserError.USER_ALREADY_EXISTS);
    }

    let otp;
    do {
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    } while (await OTP.findOne({ otp }));

    await OTP.create({ email, otp });

    return res.status(UserSuccess.OTP_SENT.statusCode).json(new ApiResponse(UserSuccess.OTP_SENT, { email ,otp}));
});

// input email should be tolower and trim
const signupPost = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        role,
        otp,
    } = req.body;

    if (!name || !password  || !role) {
        throw new ApiError(UserError.MISSING_FIELDS);
    }
    await verifyOTP(email, otp);
    try {

        const user = await User.create({
            name,
            email,
            password,
            role
        });
        return res
            .status(UserSuccess.USER_CREATED.statusCode)
            .json(new ApiResponse(UserSuccess.USER_CREATED,{email,role,name}));

    } catch (error) {
        if (error.name === "ValidationError") {
            throw new ApiError(UserError.INVALID_CREDENTIALS,error.message); // Catch validation errors
        }
        console.log(error);
        throw new ApiError(UserError.USER_CREATION_FAILED,error.message); // Catch other errors
    }
});

module.exports = {
    validateEmail,
    validatePassword,
    validateRole,
    verifyOTP,
    getUserByEmail,
    getUsersByEmails,
    signinPost,
    signupPost,
    sendOTP,
    logout
};

