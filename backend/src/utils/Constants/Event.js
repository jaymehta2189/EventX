exports.EventError = Object.freeze({
    INVALID_EVENT_ID: { customCode: 1101, message: "Invalid event ID.", statusCode: 400 },
    EVENT_NOT_FOUND: { customCode: 1102, message: "Event not found.", statusCode: 404 },
    EVENT_FULL: { customCode: 1103, message: "Event is full.", statusCode: 400 },
    INVALID_BRANCH:{ customCode: 1104, message: "Event invalied branch.", statusCode: 400 },
    INVALID_LIMIT:{ customCode: 1105, message: "User Limit or Girl Limit must be intager.", statusCode: 400 },
    INVALID_GIRL_LIMIT:{ customCode: 1106, message: "User Limit < Girl Limit possibale ?.", statusCode: 400 },
    EVENT_NOT_END: { customCode: 1107, message: "event is not end.", statusCode: 400 },
    EVENT_NOT_START: { customCode: 1108, message: "Event has not started.", statusCode: 400 },
    NO_GROUPS_FOUND: { customCode: 1109, message: "No groups found.", statusCode: 404 },

    CREATOR_NOT_FOUND: { customCode: 1110, message: "Invalid creator.", statusCode: 404 },
    CREATOR_ROLE_INVALID: { customCode: 1111, message: "creator role is invalid.", statusCode: 403 },
    CSV_FILE_NOT_PROVIDED: { customCode: 1112, message: "CSV file not provided.", statusCode: 400 },
    PROVIDE_ALL_FIELDS: { customCode: 1113, message: "Please provide all the required fields.", statusCode: 400 },
    VALIDATION_ERROR: { customCode: 1114, message: "Validation error.", statusCode: 400 },
    RESULT_NOT_DECLARED :{ customCode: 1115, message: "Result not declared.", statusCode: 400 },

    MISSING_CATEGORY: { customCode: 1120, message: "Event category is missing.", statusCode: 400 },
    INVALID_CATEGORY: { customCode: 1121, message: "Event category is invalid.", statusCode: 400 },

    MISSING_START_DATE: { customCode: 1130, message: "Event start date is missing.", statusCode: 400 },
    INVALID_START_DATE: { customCode: 1131, message: "Event start date must be in the future.", statusCode: 400 },

    MISSING_END_DATE: { customCode: 1140, message: "Event end date is missing.", statusCode: 400 },
    INVALID_END_DATE: { customCode: 1141, message: "Event end date must be after the start date.", statusCode: 400 },

    MISSING_NAME: { customCode: 1150, message: "Event name is missing.", statusCode: 400 },
    SAME_NAME:{customCode:1151,message:"Event with this name already exists.",statusCode:400},

    LOCATION_NOT_FOUND: { customCode: 1160, message: "Location is not found.", statusCode: 400 },
    LOCATION_ALREADY_BOOKED: { customCode: 1161, message: "Location is already booked for the given time.", statusCode: 401 },
    
    EVENT_CREATION_FAILED: { customCode: 1175, message: "Failed to create event.", statusCode: 500 },
    OVERLAPPING_EVENT_FAILED: { customCode: 1176, message: "Failed to overlap event.", statusCode: 500 },
    UNABLE_TO_GENERATE_CSV: { customCode: 1177, message: "Unable to generate CSV.", statusCode: 500 },
    UNABLE_TO_PROCESS_CSV:{ customCode: 1178, message: "Unable to process CSV.", statusCode: 500 },
    UNABLE_TO_RANK_GROUPS: { customCode: 1179, message: "Unable to rank groups.", statusCode: 500 }
});

exports.EventSuccess = Object.freeze({
    EVENT_CREATED : { customCode: 2101, message: "Event created successfully.", statusCode: 201 },
    EVENT_UPDATED: { customCode: 2102, message: "Event updated successfully.", statusCode: 200 },
    EVENT_ALL_FOUND: { customCode: 2103, message: "All events found successfully.", statusCode: 200 },
    EVENT_FOUND: { customCode: 2104, message: "Event found successfully.", statusCode: 200 },
    EVENT_NOT_FULL: { customCode: 2105, message: "Event is not full.", statusCode: 200 },
    FREE_LOCATIONS_FOUND:{ customCode: 2106, message: "free location is found .", statusCode: 200 },
    SEND_MAIL: { customCode: 2107, message: "Mail sent successfully.", statusCode: 200 },
    CSV_PROCESSED: { customCode: 2108, message: "CSV processed successfully.", statusCode: 200 },
    GROUPS_RANKED: { customCode: 2109, message: "Groups ranked successfully.", statusCode: 200 },

    NAME_VALIDATED: { customCode: 2150, message: "Event name is validated.", statusCode: 200 },
    START_DATE_VALIDATED: { customCode: 2151, message: "Event start date is validated.", statusCode: 200 },
    END_DATE_VALIDATED: { customCode: 2152, message: "Event end date is validated.", statusCode: 200 },
    LOCATION_VALIDATED: { customCode: 2153, message: "Event location is validated.", statusCode: 200 },
    CATEGORY_VALIDATED: { customCode: 2154, message: "Event category is validated.", statusCode: 200 },
});