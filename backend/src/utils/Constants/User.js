exports.UserError = Object.freeze({
    GROUP_NOT_FOUND: { customCode: 1007, message: "Group not found.", statusCode: 404 },
    USER_NOT_FOUND: { customCode: 1001, message: "User not found.", statusCode: 404 },
    USER_ALREADY_EXISTS: { customCode: 1002, message: "User already exists.", statusCode: 400 },
    ALREADY_STOPPED: { customCode: 1003, message: "Already stopped.", statusCode: 400 },
    ALREADY_RESUMED: { customCode: 1004, message: "Already resumed.", statusCode: 400 },
    REFRESH_TOKEN_EXPIRY: {customCode: 1005, message: "refresh token expiry.",statusCode:400},
    IS_NOT_GOOGLE_USER: {customCode:1006 , message:"user is not google with google account.",statusCode:400},
    
    MISSING_EMAIL: { customCode: 1010, message: "Email is missing.", statusCode: 400 },
    INVALID_EMAIL: { customCode: 1011, message: "The email provided is invalid.", statusCode: 400 },
    INVALID_DDU_EMAIL: { customCode: 1012, message: "Login with Only DDU Email.", statusCode: 400 },

    MISSING_ROLE: { customCode: 1020, message: "Role is missing.", statusCode: 400 },
    INVALID_ROLE: { customCode: 1021, message: "The role provided is invalid.", statusCode: 400 },
    INVALID_SEM: { customCode: 1022, message: "Invalid semester.", statusCode: 400 },

    MISSING_PASSWORD: { customCode: 1030, message: "Password is missing.", statusCode: 400 },
    PASSWORD_MISMATCH: { customCode: 1031, message: "Password mismatch.", statusCode: 400 },
    INVALID_PASSWORD: { customCode: 1032, message: "Password must be at least 8 characters.", statusCode: 400 },

    PROFILE_UPDATE_FAILED:{customCode:2011,message:"Profile update failed.",statusCode:400},

    MISSING_OTP: { customCode: 1040, message: "OTP is missing.", statusCode: 400 },
    INVALID_OTP: { customCode: 1041, message: "Invalid OTP.", statusCode: 400 },

    MISSING_FIELDS: { customCode: 1050, message: "Required fields are missing.", statusCode: 400 },
    COOKIE_NOT_AVAILABLE: { customCode: 1051, message: "Cookie not available.", statusCode: 400 },
    INVALID_CREDENTIALS: { customCode: 1052, message: "Invalid credentials.", statusCode: 400 },
    STAFF_NOT_HAVE_ACCESS: {customCode:1053,message:"Staff not have access.",statusCode:400},
    USER_ALREADY_ORG: {customCode:1054,message:"student already Org.",statusCode:400},

    USER_CREATION_FAILED: { customCode: 1075, message: "User creation failed.", statusCode: 500 },
    ADMIN_FAILED_HODS :{ customCode: 1076, message: "Admin view unsafe hod failed.", statusCode: 500 },
    ADMIN_FAILED_ORGS:{ customCode: 1077, message: "Admin view unsafe org failed.", statusCode: 500 },
    HOD_FAILED_ORGS :{ customCode: 1078, message: "Hod view unsafe org failed.", statusCode: 500 },
    CLEANUP_FAILED: { customCode: 1079, message: "Cleanup failed.", statusCode: 500 },
    STOP_CLEANUP_FAILED: { customCode: 1080, message: "Stop cleanup failed.", statusCode: 500 },
    RESUME_CLEANUP_FAILED: { customCode: 1081, message: "Resume cleanup failed.", statusCode: 500 }
});

exports.UserSuccess = Object.freeze({
    GROUP_FOUND: { customCode: 2020, message: "Group found successfully.", statusCode: 200 },
    USER_CREATED: { customCode: 2001, message: "User created successfully.", statusCode: 201 },
    USER_UPDATED: { customCode: 2002, message: "User updated successfully.", statusCode: 200 },
    ADMIN_UNHOD_VIEW: { customCode: 2003, message: "admin view unsafe hod.", statusCode: 200 },
    ADMIN_UNORG_VIEW: { customCode: 2004, message: "admin view unsafe org.", statusCode: 200 },
    HOD_UNORG_VIEW: { customCode: 2005, message: "hod view unsafe org.", statusCode: 200 },
    JOIN_EVENT: {customCode:2006,message:"get Join event by user.",statusCode:200},
    JOIN_GROUP: {customCode:2007,message:"get Join group by user.",statusCode:200},
    LOG_IN: { customCode:2008 , message:"Login Successfully.",statusCode:201},
    LOG_OUT: { customCode:2009 , message:"Logout Successfully.",statusCode:200},
    PROFILE_UPDATED:{customCode:2010,message:"Profile updated successfully.",statusCode:200},
    OTP_SENT: { customCode: 2011, message: "OTP sent successfully.", statusCode: 200 },
    OTP_VERIFIED: { customCode: 2012, message: "OTP verified successfully.", statusCode: 200 },
    STOP_CLEANUP_SUCCESS:{ customCode: 2013, message: "Stop cleanup successful.", statusCode: 200 },
    RESUME_CLEANUP_SUCCESS:{ customCode: 2014, message: "Resume cleanup successful.", statusCode: 200 },
    USER_FOUND: { customCode: 2015, message: "User found successfully.", statusCode: 200 },
    LOG_OUT: { customCode: 2016, message: "Log Out.", statusCode: 200 },

    EMAIL_VALIDATED: { customCode: 2050, message: "Email validated successfully.", statusCode: 200 },

    ROLE_VALIDATED: { customCode: 2051, message: "Role validated successfully.", statusCode: 200 },

    PASSWORD_VALIDATED: { customCode: 2052, message: "Password validated successfully.", statusCode: 200 },
    CLEANUP_SUCCESS: { customCode: 2053, message: "Cleanup successful.", statusCode: 200 },
});

