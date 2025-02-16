exports.GroupError = Object.freeze({

    MISSING_GROUP_NAME: { customCode: 1201, message: "Group name is missing.", statusCode: 400 },
    SAME_GROUP_EXISTS: { customCode: 1202, message: "Group with this name already exists.", statusCode: 400 },
    MISSING_FIELDS: { customCode: 1203, message: "Required fields are missing.", statusCode: 400 },
    INVALID_GROUP: { customCode: 1204, message: "Invalid group id.", statusCode: 400 },
    INVALID_CODE: { customCode: 1205, message: "Invalid code.", statusCode: 400 },
    INVALID_USER: { customCode: 1206, message: "Invalid user.", statusCode: 400 },
    CREATOR_NOT_JOIN: { customCode: 1207, message: "Creator cannot join the group.", statusCode: 400 },
    INVALID_VERIFICATION: { customCode: 1208, message: "Group verification failed.", statusCode: 400 },

    GROUP_LIMIT_EXCEEDED: { customCode: 1210, message: "Group limit exceeded.", statusCode: 400 },
    MISSING_MEMBER_EMAIL: { customCode: 1211, message: "Member email is missing.", statusCode: 400 },
    DUPLICATE_EMAIL: { customCode: 1212, message: "Duplicate email.", statusCode: 400 },
    INVALID_MEMBER_ROLE: { customCode: 1213, message: "Invalid role.", statusCode: 403 },
    MISSING_GROUP_SIZE: { customCode: 1214, message: "Group size is missing.", statusCode: 400 },

    INVALID_SCORE: { customCode: 1220, message: "Group score must be between 0 and 100.", statusCode: 400 },
    INVALID_EVENT: { customCode: 1221, message: "Event not found.", statusCode: 404 },

    MISSING_GROUP_LEADER_EMAIL: { customCode: 1230, message: "Group leader email is missing.", statusCode: 400 },
    INVALID_GROUP_LEADER: { customCode: 1231, message: "Group leader not found.", statusCode: 404 },
    ORG_INVALIED: { customCode: 1232, message: "Group member is creator of event.", statusCode: 403 },
    MEMBER_BRANCH_INVALIED: { customCode: 1233, message: "Group member branch invalid.", statusCode: 400 },
    LESS_GIRL: { customCode: 1234, message: "Group member have less girl.", statusCode: 400 },
    USER_ALREADY_JOIN: { customCode: 1235, message: "Group member already joined event.", statusCode: 400 },
    INVALID_MEMBER_EMAIL: { customCode: 1236, message: "Invalid email.", statusCode: 400 },
    CREATOR_NOT_SCAN: { customCode: 1237, message: "QR not scanned by event's creator.", statusCode: 400 },
    QR_ALREADY_SCAN: { customCode: 1238, message: "QR is already scanned.", statusCode: 400 },
    EVENT_NOT_START: { customCode: 1239, message: "Event has not started.", statusCode: 400 },
    ONLY_GIRL_JOIN: { customCode: 1240, message: "Only girls can join.", statusCode: 400 },
    VALIDATION_ERROR: { customCode: 1241, message: "Validation error.", statusCode:400},

    QR_CODE_GENERATION_FAILED: { customCode: 1275, message: "QR code generation failed.", statusCode: 500 },
    GROUP_CREATION_FAILED: { customCode: 1276, message: "Failed to create group.", statusCode: 500 },
    CODE_GENERATION_FAILED: { customCode: 1277, message: "Failed to generate code.", statusCode: 500 },
    TRY_TO_CHANGE_REQ_BODY: { customCode: 1278, message: "Hello Hacker. :)", statusCode: 500 },
    GROUP_JOIN_FAILED: { customCode: 1279, message: "Failed to join group.", statusCode: 500 }
});


exports.GroupSuccess = Object.freeze({
    GROUP_CREATED: { customCode: 2201, message: "Group created successfully.", statusCode: 201 },
    GROUP_UPDATED: { customCode: 2202, message: "Group updated successfully.", statusCode: 200 },
    GROUP_FOUND: { customCode: 2203, message: "Group found successfully.", statusCode: 200 },
    GROUP_VERIFIED: {customCode: 2204,message:"Group Verified.",statusCode:200},

    GROUP_NAME_VALIDATED: { customCode: 2250, message: "Group name is validated.", statusCode: 200 },
    MEMBER_ROLE_VALIDATED: { customCode: 2251, message: "Member role is validated.", statusCode: 200 },
    GROUP_LEADER_VALIDATED: { customCode: 2252, message: "Group leader is validated.", statusCode: 200 },
    GROUP_SIZE_VALIDATED: { customCode: 2253, message: "Group size is validated.", statusCode: 200 },
    QR_SCAN: { customCode: 2254, message: "Qr Scan By Event's Creator.", statusCode: 200 },
    GROUP_JOIN_SUCCESS: { customCode: 2255, message: "Group member join event successfully.", statusCode: 200 },
});