exports.UserError = Object.freeze({
    USER_NOT_FOUND: { customCode: 1001, message: "User not found.", statusCode: 404 },
    USER_ALREADY_EXISTS: { customCode: 1002, message: "User already exists.", statusCode: 400 },
    
    MISSING_EMAIL: { customCode: 1010, message: "Email is missing.", statusCode: 400 },
    INVALID_EMAIL: { customCode: 1011, message: "The email provided is invalid.", statusCode: 400 },

    MISSING_ROLE: { customCode: 1020, message: "Role is missing.", statusCode: 400 },
    INVALID_ROLE: { customCode: 1021, message: "The role provided is invalid.", statusCode: 400 },

    MISSING_PASSWORD: { customCode: 1030, message: "Password is missing.", statusCode: 400 },
    PASSWORD_MISMATCH: { customCode: 1031, message: "Password mismatch.", statusCode: 400 },
    INVALID_PASSWORD: { customCode: 1032, message: "Password must be at least 8 characters.", statusCode: 400 },

    MISSING_OTP: { customCode: 1040, message: "OTP is missing.", statusCode: 400 },
    INVALID_OTP: { customCode: 1041, message: "Invalid OTP.", statusCode: 400 },

    MISSING_FIELDS: { customCode: 1050, message: "Required fields are missing.", statusCode: 400 },
    COOKIE_NOT_AVAILABLE: { customCode: 1051, message: "Cookie not available.", statusCode: 400 },
    INVALID_CREDENTIALS: { customCode: 1052, message: "Invalid credentials.", statusCode: 400 },

    USER_CREATION_FAILED: { customCode: 1075, message: "User creation failed.", statusCode: 500 },
    ADMIN_FAILED_HODS :{ customCode: 1076, message: "Admin view unsafe hod failed.", statusCode: 500 },
    ADMIN_FAILED_ORGS:{ customCode: 1077, message: "Admin view unsafe org failed.", statusCode: 500 },
    HOD_FAILED_ORGS :{ customCode: 1078, message: "Hod view unsafe org failed.", statusCode: 500 }
});

exports.UserSuccess = Object.freeze({
    USER_CREATED: { customCode: 2001, message: "User created successfully.", statusCode: 201 },
    USER_UPDATED: { customCode: 2002, message: "User updated successfully.", statusCode: 200 },
    ADMIN_UNHOD_VIEW: { customCode: 2003, message: "admin view unsafe hod.", statusCode: 200 },
    ADMIN_UNORG_VIEW: { customCode: 2004, message: "admin view unsafe org.", statusCode: 200 },
    HOD_UNORG_VIEW: { customCode: 2005, message: "hod view unsafe org.", statusCode: 200 },

    LOG_IN: { customCode:2006 , message:"Login Successfully.",statusCode:201},
    LOG_OUT: { customCode:2007 , message:"Logout Successfully.",statusCode:200},

    OTP_SENT: { customCode: 2008, message: "OTP sent successfully.", statusCode: 200 },
    OTP_VERIFIED: { customCode: 2009, message: "OTP verified successfully.", statusCode: 200 },

    EMAIL_VALIDATED: { customCode: 2050, message: "Email validated successfully.", statusCode: 200 },

    ROLE_VALIDATED: { customCode: 2051, message: "Role validated successfully.", statusCode: 200 },

    PASSWORD_VALIDATED: { customCode: 2052, message: "Password validated successfully.", statusCode: 200 }
});