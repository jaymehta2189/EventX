const Event = require("../models/event.model");
const orgController = require("./org.controller");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

exports.findAllEventsByOrgId = async function(orgId , fields = null) {
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new Error("Invalid Organization ID");
    }

    const events = await Event.find({ creator: orgId }).select(fields);

    // if (!events || events.length === 0) {
    //     throw new ApiError(404, "No events found for the organization");
    // }

    return events;
};

exports.createEvent = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, location, category, pricePool, description , creator , groupLimit } = req.body;

    if(!name || !startDate || !endDate || !location || !category || !pricePool || !description || !groupLimit ){
        throw new ApiError(400, "Please provide all required fields");
    }
    // const orgcreator =await orgController.validateOrgId({orgId:creator ,fields:"_id"});
    await orgController.validateOrgId({orgId:creator ,fields:"_id"});

    const existEvent = await Event.findOne({ name }).select("_id");

    if (existEvent) {
        throw new ApiError(400, "Event name already exists");
    }

    try {

        const timeLimit = new Date(new Date(endDate).getTime() + 2 * 24 * 60 * 60 * 1000);

        const event = await Event.create({
            name,
            startDate,
            endDate,
            location,
            category,
            pricePool,
            groupLimit,
            description,
            creator,
            timeLimit
        });

        return res.status(201).json(new ApiResponse(201, event, "Event created successfully"));
    
    } catch (error) {
        if (error.name === "ValidationError") {
            console.log("validation error");
            throw new ApiError(400, error.message); // Catch validation errors
        }
        throw new ApiError(500, "An error occurred while creating the event"); // Catch other errors
    }    
});

exports.findAllEvent = asyncHandler(async (req, res) => { 
    const events = await Event.aggregate([
        { $match: { startDate: { $gte: new Date() } } },
        { $sample: { size: 10 } },
        { 
            $project: { 
                _id: 1, 
                name: 1, 
                startDate: 1, 
                endDate: 1, 
                location: 1, 
                category: 1, 
                pricePool: 1, 
                avatar: 1 
            }
        }
    ]);

    // if(!events || events.length === 0){
    //     throw new ApiError(404, "No events found");
    // }
    return res.status(200).json(new ApiResponse(200, events, "Events Found"));
});

exports.findEventById = asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;

    if(!mongoose.Types.ObjectId.isValid(eventId)){
        throw new ApiError(400, "Please provide a valid event ID");
    }

    const event = await Event.findById(eventId).select("_id name avatar startDate endDate location category pricePool description creator");
    
    if(!event){
        throw new ApiError(404, "Event not found");
    }
    return res.status(200).json(new ApiResponse(200, event, "Event Found"));
});