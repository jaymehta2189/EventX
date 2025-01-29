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
const axios = require('axios');

// // ===============================
// const { google } = require('googleapis');
// const axios = require('axios');
// const url = require('url');
// const crypto = require('crypto');
// const session = require('express-session');
// const http = require('http');
// const https = require('https');
// // ===============================

// // ===============================
// const oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URL
// );

// const scopes = [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/calendar'
// ];

// const calendarService = google.calendar({ version: 'v3', auth: process.env.API_KEY });

//  const Oauth2 = asyncHandler (async (req, res) => {
//     const state = crypto.randomBytes(32).toString('hex');
//     // Store state in the session
//     req.session.state = state;

//     const url = oauth2Client.generateAuthUrl({
//         access_type:'offline',
//         scope:scopes,
//         include_granted_scopes: true,
//         state: state,
//         // hd:"ddu.ac.in"
//     });

//     res.redirect(url);
// });

// async function fetchUserInfo(token) {
//     const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//     });

//     return await response.json();
//   }

// const Oauth2Callback = asyncHandler(async (req, res) => {
//     let q = url.parse(req.url, true).query;
//     console.log('q:', q);
//     if (q.error) {
//       console.log('Error:' + q.error);
//       return res.end('Error: ' + q.error);
//     } else if (q.state !== req.session.state) { //check state value
//       console.log('State mismatch. Possible CSRF attack');
//       return res.end('State mismatch. Possible CSRF attack');
//     } else {

//     console.log(req.query);
//     let { tokens } = await oauth2Client.getToken(req.query.code);
//     oauth2Client.setCredentials(tokens);

//       /** Save credential to the global variable in case access token was refreshed.
//         * ACTION ITEM: In a production app, you likely want to save the refresh token
//         *              in a secure persistent database instead. */

//     const user = await fetchUserInfo(tokens.access_token);
//         console.log('User Info:', user);
//     const data = cacheData.GetUserDataById(user.id);
//         console.log('Data:', data);
//     if (data) {
//         return res.send("User already exists");
//     }

//     const muser = await User.create({
//         name: user.name,
//         email: user.email,
//         role: "user",
//         password: "12345678",
//         gender:"male"
//     });

//     await cacheData.cacheUser(muser);


//       if (tokens.scope.includes(scopes[0]))
//       {
//         // User authorized Calendar permission.
//         // Calling the APIs, etc.
//       }
//       else
//       {
//         // User didn't authorize Calendar permission.
//       }
//       return res.redirect("http://localhost:5176/home");
//     }
// });
// // ===============================

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

const viewUserProfile = asyncHandler(async (req, res) => {

    const userId = req.params.id;

    const users = await cacheData.GetUserDataById('$', userId);

    if (users.length === 0) {
        throw new ApiError(UserError.USER_NOT_FOUND);
    }

    const user = users[0];

    return res.status(UserSuccess.USER_FOUND.statusCode)
        .json(new ApiResponse(UserSuccess.USER_FOUND, user));

});

const updateProfile = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { role , gender , sem , rollno , contactdetails} = req.body;
    try {

        const userObject = await cacheData.GetUserDataById("$._id",req.user._id);

        if(userObject.length === 0){
            throw new ApiError(UserError.USER_NOT_FOUND);
        }

        const user = await User.findById({_id:new mongoose.Types.ObjectId(id)});

        user.role = role;
        user.gender=gender;
        user.sem = sem;
        user.rollno = rollno;
        user.contactdetails = contactdetails;

        await user.save();

        await cacheData.cacheUser(user);

        console.log("after update profile");
        console.log(user);

        const token= createTokenForUser(user);

        return res
            .status(UserSuccess.LOG_IN.statusCode)
            .cookie("token", token,{path:"/"})
            .json(new ApiResponse(UserSuccess.LOG_IN, token));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(UserError.PROFILE_UPDATE_FAILED);
    }
});

async function getOrgIdByBranch(branch) {
    try {
        let cursor = '0';
        let pipeline = RedisClient.pipeline();
        let orgs = [];
        do {

            const [newCursor, keys] = await RedisClient.scan(cursor, 'MATCH', 'User:Email:*');

            cursor = newCursor;
            if (keys.length > 0) {

                keys.forEach((idResult) => {
                    const branchCode = idResult.split(":")[2].substring(2, 4).toLowerCase();
                    if ('all' === branch || branchCode === branch.toLowerCase()) {
                        pipeline.hmget(idResult, 'id', 'role');
                    }
                });

                const eventsData = await pipeline.exec();

                for (const event of eventsData) {
                    const [error, data] = event;
                    const [id, role] = data;
                    if (!error && role === "org") {
                        orgs.push(id);
                    }
                }

                pipeline.reset();
            }
        } while (cursor !== '0');

        return orgs;
    } catch (error) {
        console.error('Error fetching active events:', error);
        return [];
    }
}

const getEvent = asyncHandler(async (req, res) => {
    try {
        const eventIds = await cacheData.GetEventIdsByUserId(req.params.id);
        const events = await cacheData.GetEventDataById('$', ...eventIds);
        return res
            .status(UserSuccess.JOIN_EVENT.statusCode)
            .json(new ApiResponse(UserSuccess.JOIN_EVENT, events));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(UserError.USER_NOT_FOUND);
    }
});

const getGroup = asyncHandler(async (req, res) => {
    try {
        const groupIds = await cacheData.GetGroupIdsByUserId(req.params.id);
        const groups = await cacheData.GetGroupDataById('$', ...groupIds);
        return res
            .status(UserSuccess.JOIN_GROUP.statusCode)
            .json(new ApiResponse(UserSuccess.JOIN_GROUP, groups));
    } catch (error) {
        console.log(error.message);
        throw new ApiError(UserError.USER_NOT_FOUND);
    }
});

// change
const approveOrganizationSignup = asyncHandler(async (req, res) => {
    const { Id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(Id)) {
        throw new ApiError(UserError.USER_NOT_FOUND);
    }

    const unsafeUsers = await cacheData.GetUnsafeUserDataById('$', Id);

    if (unsafeUsers.length === 0) {
        throw new ApiError(UserError.USER_NOT_FOUND);
    }

    const unsafeUser = unsafeUsers[0];

    const user = new User({
        name: unsafeUser.name,
        email: unsafeUser.email,
        password: unsafeUser.password,
        role: unsafeUser.role,
    });

    await user.save({ validateBeforeSave: false });

    await cacheData.cacheUser(user);

    await Unsafe_User.findByIdAndDelete(Id);

    return res
        .status(UserSuccess.USER_CREATED.statusCode)
        .json(new ApiResponse(UserSuccess.USER_CREATED, { email: user.email, role: user.role, name: user.name }));
});

const getEventCreators = asyncHandler(async (req, res) => {

    const creatorIds = await getOrgIdByBranch('all');

    const creatorNameList = await cacheData.GetUserDataById('$.name', ...creatorIds);

    // if (creatorNameList.length === 0) {
    //     throw new ApiError(UserError.USER_NOT_FOUND);
    // }

    return res.status(UserSuccess.USER_FOUND.statusCode)
        .json(new ApiResponse(UserSuccess.USER_FOUND, creatorNameList));
});

const getOrganizationsByBranch = asyncHandler(async (req, res) => {
    const branch = req.params.branch;

    if (!User.Branches.includes(branch.toLowerCase())) {
        branch = req.user.email.substring(2, 4).toLowerCase();
    }

    const creatorIds = await getOrgIdByBranch(branch);

    const creatorList = await cacheData.GetUserDataById('$', ...creatorIds);

    // if (creatorList.length === 0) {
    //     throw new ApiError(UserError.USER_NOT_FOUND);
    // }

    return res.status(UserSuccess.USER_FOUND.statusCode)
        .json(new ApiResponse(UserSuccess.USER_FOUND, creatorList));
});

const getAllOrganizations = asyncHandler(async (req, res) => {
    const creatorIds = await getOrgIdByBranch('all');

    const creatorList = await cacheData.GetUserDataById('$', ...creatorIds);

    // if (creatorList.length === 0) {
    //     throw new ApiError(UserError.USER_NOT_FOUND);
    // }

    return res.status(UserSuccess.USER_FOUND.statusCode)
        .json(new ApiResponse(UserSuccess.USER_FOUND, creatorList));
});

async function getUnVerifyOrgIdByBranch(branch) {
    try {
        let cursor = '0';
        let pipeline = RedisClient.pipeline();
        let orgs = [];
        do {

            const [newCursor, keys] = await RedisClient.scan(cursor, 'MATCH', 'Unsafe_User:Email:*');

            cursor = newCursor;
            if (keys.length > 0) {

                keys.forEach((idResult) => {
                    const branchCode = idResult.split(":")[2].substring(2, 4).toLowerCase();
                    if ('all' === branch || branchCode === branch.toLowerCase()) {
                        pipeline.hmget(idResult, 'id', 'role');
                    }
                });

                const eventsData = await pipeline.exec();

                for (const event of eventsData) {
                    const [error, data] = event;
                    const [id, role] = data;
                    if (!error && role === "org") {
                        orgs.push(id);
                    }
                }

                pipeline.reset();
            }
        } while (cursor !== '0');

        return orgs;
    } catch (error) {
        console.error('Error fetching active events:', error);
        return [];
    }
}

const getUnverifiedOrgs = asyncHandler(async (req, res) => {
    const unverifiedOrgIds = await getUnVerifyOrgIdByBranch('all');
    const unverifiedOrgs = await cacheData.GetUnsafeUserDataById('$', ...unverifiedOrgIds);

    // if (unverifiedOrgs.length === 0) {
    //     throw new ApiError(UserError.USER_NOT_FOUND);
    // }

    return res.status(UserSuccess.USER_FOUND.statusCode)
        .json(new ApiResponse(UserSuccess.USER_FOUND, unverifiedOrgs));
});

const getUnverifiedOrgsByBranch = asyncHandler(async (req, res) => {
    let branch = req.params.branch;

    if (!User.Branches.includes(branch.toLowerCase())) {
        branch = req.user.email.substring(2, 4).toLowerCase();
    }

    const unverifiedOrgIds = await getUnVerifyOrgIdByBranch(branch);
    const unverifiedOrgs = await cacheData.GetUnsafeUserDataById('$', ...unverifiedOrgIds);

    // if (unverifiedOrgs.length === 0) {
    //     throw new ApiError(UserError.USER_NOT_FOUND);
    // }

    return res.status(UserSuccess.USER_FOUND.statusCode)
        .json(new ApiResponse(UserSuccess.USER_FOUND, unverifiedOrgs));
});

// clean up
const cleanup = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get('http://localhost:9000/cleanup');

        if (response.status !== 200) {
            throw new ApiError(UserError.CLEANUP_FAILED, `Cleanup request failed with status code: ${response.status}`);
        }

        return res
            .status(UserSuccess.CLEANUP_SUCCESS.statusCode)
            .json(new ApiResponse(UserSuccess.CLEANUP_SUCCESS, response.data));
    } catch (error) {
        console.log(error.message);
        if (error.response) {
            throw new ApiError(UserError.CLEANUP_FAILED, `Cleanup request failed: ${error.response.data || error.message}`);
        }
        throw new ApiError(UserError.CLEANUP_FAILED, error.message);
    }
});

const stopCleanupJob = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get('http://localhost:9000/stop');

        if (response.status === 400) {
            throw new ApiError(UserError.ALREADY_STOPPED, `Stop cleanup job request failed with status code: ${response.status}`);
        }

        return res
            .status(UserSuccess.STOP_CLEANUP_SUCCESS.statusCode)
            .json(new ApiResponse(UserSuccess.STOP_CLEANUP_SUCCESS, response.data));
    } catch (error) {
        console.log(error.message);
        if (error.response) {
            throw new ApiError(UserError.STOP_CLEANUP_FAILED, `Stop cleanup job request failed: ${error.response.data || error.message}`);
        }
        throw new ApiError(UserError.STOP_CLEANUP_FAILED, error.message);
    }
});

const resumeCleanupJob = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get('http://localhost:9000/resume');

        if (response.status === 400) {
            throw new ApiError(UserError.ALREADY_RESUMED, `Resume cleanup job request failed with status code: ${response.status}`);
        }

        return res
            .status(UserSuccess.RESUME_CLEANUP_SUCCESS.statusCode)
            .json(new ApiResponse(UserSuccess.RESUME_CLEANUP_SUCCESS, response.data));
    } catch (error) {
        console.log(error.message);
        if (error.response) {
            throw new ApiError(UserError.RESUME_CLEANUP_FAILED, `Resume cleanup job request failed: ${error.response.data || error.message}`);
        }
        throw new ApiError(UserError.RESUME_CLEANUP_FAILED, error.message);
    }
});

module.exports = {

    viewUserProfile,
    validateEmail,
    updateProfile,
    verifyOTP,
    signinPost,
    signupPost,
    sendOTP,
    logout,

    cleanup,
    stopCleanupJob,
    resumeCleanupJob,

    getEvent,
    getGroup,

    getEventCreators,
    
    getOrganizationsByBranch,
    getAllOrganizations,
    getUnverifiedOrgs,
    getUnverifiedOrgsByBranch,

    // change it late bec. google auth
    approveOrganizationSignup
    // make for hod
};