const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const OTP = require("../models/otp.model");
const otpGenerator = require("otp-generator");
const Group = require("../models/group.model.js");

const RedisClient = require("../service/configRedis.js")
const cacheData = require("../service/cacheData.js")
const { UserError, UserSuccess } = require("../utils/Constants/User.js");
const Unsafe_User = require("../models/unsafe_user.model.js");
const { UnSafeUserSuccess } = require("../utils/Constants/UnSafe_User.js");


// input email should be tolower and trim
async function validateEmail(email) {

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

    const SaveOTP = await RedisClient.get(`OTP:${email}`);

    if (SaveOTP) {
        if (SaveOTP.length === 0 || otp !== SaveOTP) {
            throw new ApiError(UserError.INVALID_OTP);
        }
        return;
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0 || otp !== response[0].otp) {
        throw new ApiError(UserError.INVALID_OTP);
    }
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
    } while (await OTP.findOne({ otp }).select("otp").lean());

    await OTP.create({ email, otp });

    await RedisClient.set(`OTP:${email}`, otp);

    await RedisClient.expire(`OTP:${email}`, 300); // 5 min

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
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        // const 
        await cacheData.cacheUser(user);

        return res
            .status(UserSuccess.USER_CREATED.statusCode)
            .json(new ApiResponse(UserSuccess.USER_CREATED, { email, role, name }));
        // }

        // await Unsafe_User.collection.insertOne({
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
        }).select("_id name email branch").lean();

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
        }).select("_id name email branch").lean();

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
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $project: {
                    branch: 1
                }
            },
            {
                $lookup: {
                    from: "unsafe_users",
                    localField: User.allowedRoles[1],
                    foreignField: "role",
                    as: "users"
                }
            },
            {
                $match: {
                    "users.branch": "$branch"
                }
            },
            {
                $project: {
                    "users._id": 1,
                    "users.name": 1,
                    "users.email": 1
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

const updateProfile = asyncHandler(async (req, res) => {
    const { sem, rollno, contactdetails } = req.body;
    try {
        console.log("hello");
        console.log("req.user:", req.user);

        const user = await User.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.user._id) }, { sem, rollno, contactdetails }).select("_id");
        console.log("Updated user:", user);

        return res
            .status(UserSuccess.PROFILE_UPDATED.statusCode)
            .json(new ApiResponse(UserSuccess.PROFILE_UPDATED));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(UserError.PROFILE_UPDATE_FAILED);
    }
});

module.exports = {
    validateEmail,
    updateProfile,
    verifyOTP,
    signinPost,
    signupPost,
    sendOTP,
    logout,

    AdminViewForHOD,
    AdminViewForORG,
    // make for hod
};

