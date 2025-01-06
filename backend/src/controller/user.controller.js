const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const OTP = require("../models/otp.model");
const otpGenerator = require("otp-generator");
const Group = require("../models/group.model.js");

const { UserError, UserSuccess } = require("../utils/Constants/User.js");
const Unsafe_User = require("../models/unsafe_user.model.js");
const { UnSafeUserSuccess } = require("../utils/Constants/UnSafe_User.js");



// input email should be tolower and trim
async function validateEmail (email) {

    if (!email) {
        throw new ApiError(UserError.MISSING_EMAIL);
    }

    if (!User.emailPattern.test(email)) {
        throw new ApiError(UserError.INVALID_EMAIL);
    }

    const user = await User.exists({ email });

    if (user) {
        throw new ApiError(UserError.USER_ALREADY_EXISTS);
    }
};

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
            .json(new ApiResponse(UserSuccess.LOG_IN, token));

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.log(error);
        throw new ApiError(UserError.COOKIE_NOT_AVAILABLE, error.message);
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
    
    await validateEmail(email);

    let otp;
    do {
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    } while (await OTP.findOne({ otp }));

    await OTP.create({ email, otp });

    return res.status(UserSuccess.OTP_SENT.statusCode).json(new ApiResponse(UserSuccess.OTP_SENT, { email, otp }));
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

    if (!name || !password || !role) {
        throw new ApiError(UserError.MISSING_FIELDS);
    }

    await verifyOTP(email, otp);

    try {
        // for user role 
        // if (role === User.allowedRoles[0]) {
            await User.create({
                name,
                email,
                password,
                role
            });

            return res
                .status(UserSuccess.USER_CREATED.statusCode)
                .json(new ApiResponse(UserSuccess.USER_CREATED, { email, role, name }));
        // }

        // await Unsafe_User.create({
        //     name,
        //     email,
        //     password,
        //     role
        // });

        // return res
        //     .status(UnSafeUserSuccess.WAIT_FOR_CONFIRMATION.statusCode)
        //     .json(UnSafeUserSuccess.WAIT_FOR_CONFIRMATION);

    } catch (error) {

        if (error.name === "ValidationError") {
            throw new ApiError(UserError.INVALID_CREDENTIALS, error.message); // Catch validation errors
        }

        console.log(error);
        throw new ApiError(UserError.USER_CREATION_FAILED, error.message); // Catch other errors

    }
});

// view hod reQuest for sign up
const AdminViewForHOD = asyncHandler(async (req, res) => {
    try {
        const Hods = await Unsafe_User.find({
            role: User.allowedRoles[2]
        }).select("_id name email branch");

        return res
            .status(UserSuccess.ADMIN_UNHOD_VIEW.statusCode)
            .json(UserSuccess.ADMIN_UNHOD_VIEW, Hods);

    } catch (error) {
        console.log(error.message);
        throw new ApiError(UserError.ADMIN_FAILED_HODS);
    }
});

//view org reQuest for sign up
const AdminViewForORG = asyncHandler(async (req, res) => {
    try {
        const Orgs = await Unsafe_User.find({
            role: User.allowedRoles[1]
        }).select("_id name email branch");

        return res
            .status(UserSuccess.ADMIN_UNORG_VIEW.statusCode)
            .json(UserSuccess.ADMIN_UNORG_VIEW, Orgs);

    } catch (error) {
        console.log(error.message);
        throw new ApiError(UserError.ADMIN_FAILED_ORGS);
    }
});

// view 
const HodViewORG = asyncHandler(async (req, res) => {
    try {

        // not work it
        const pipeline = [
            {
                $match:{
                    _id : new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $project:{
                    branch:1
                }
            },
            {
                $lookup:{
                    from:"unsafe_users",
                    localField: User.allowedRoles[1],
                    foreignField:"role",
                    as:"users"
                }
            },
            {
                $match:{
                    "users.branch": "$branch"
                }
            },
            {
                $project:{
                    "users._id":1,
                    "users.name":1,
                    "users.email":1
                }
            }
        ];

        const Orgs = await User.aggregate(pipeline).exec();

        return res
            .status(UserSuccess.HOD_UNORG_VIEW.statusCode)
            .json(UserSuccess.HOD_UNORG_VIEW, Orgs);

    } catch (error) {
        console.log(error.message);
        throw new ApiError(UserError.HOD_FAILED_ORGS);
    }
});

module.exports = {
    validateEmail,
    
    verifyOTP,
    getUserByEmail,
    getUsersByEmails,
    signinPost,
    signupPost,
    sendOTP,
    logout,

    AdminViewForHOD,
    AdminViewForORG
    // make for hod
};

