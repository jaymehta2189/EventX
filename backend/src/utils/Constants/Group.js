exports.GroupError = Object.freeze({

    MISSING_GROUP_NAME: { customCode: 1201, message: "Group name is missing.", statusCode: 400 },
    SAME_GROUP_EXSIST: { customCode: 1202, message: "Group with this name already exists.", statusCode: 400 },
    MISSING_FIELDS: { customCode: 1203, message: "Required fields are missing.", statusCode: 400 },

    GROUP_LIMIT_EXCEEDED: { customCode: 1210, message: "Group limit exceeded.", statusCode: 400 },
    MISSING_MEMBER_EMAIL: { customCode: 1211, message: "Member email is missing.", statusCode: 400 },
    DUPLICATE_EMAIL: { customCode: 1212, message: "Duplicate email.", statusCode: 400 },
    INVALID_MEMBER_ROLE: { customCode: 1213, message: "Invalid role.", statusCode: 403 },
    MISSING_GROUP_SIZE: { customCode: 1214, message: "Group size is missing.", statusCode: 400 },

    INVALID_SCORE: { customCode: 1220, message: "Group score must be between 0 and 100.", statusCode: 400 },
    INVALID_EVENT: { customCode: 1221, message: "Event not found.", statusCode: 404 },

    MISSING_GROUP_LEADER_EMAIL: { customCode: 1230, message: "Group leader email is missing.", statusCode: 400 },
    INVALID_GROUP_LEADER: { customCode: 1231, message: "Group leader not found.", statusCode: 404 },
    ORG_INVALIED:{ customCode: 1232, message: "Group member is creator of event.", statusCode: 403 },
    
    QR_CODE_GENERATION_FAILED: { customCode: 1275, message: "QR code generation failed.", statusCode: 500 },
    GROUP_CREATION_FAILED: { customCode: 1276, message: "Failed to create group.", statusCode: 500 }
});


exports.GroupSuccess = Object.freeze({
    GROUP_CREATED: { customCode: 2201, message: "Group created successfully.", statusCode: 201 },
    GROUP_UPDATED: { customCode: 2202, message: "Group updated successfully.", statusCode: 200 },
    GROUP_FOUND: { customCode: 2203, message: "Group found successfully.", statusCode: 200 },

    GROUP_NAME_VALIDATED: { customCode: 2250, message: "Group name is validated.", statusCode: 200 },
    MEMBER_ROLE_VALIDATED: { customCode: 2251, message: "Member role is validated.", statusCode: 200 },
    GROUP_LEADER_VALIDATED: { customCode: 2252, message: "Group leader is validated.", statusCode: 200 },
    GROUP_SIZE_VALIDATED: { customCode: 2253, message: "Group size is validated.", statusCode: 200 },
});