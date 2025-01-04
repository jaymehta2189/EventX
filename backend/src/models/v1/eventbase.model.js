const {Schema,mongoose}=require("mongoose");

const eventBase = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true
    },
    avatar: {
        type: String
        // required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true,
        index: true
    },
    endDate: {
        type: Date,
        required: true,
        index: true
    },
    location: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        index: true,
        enum : ["A","B","C","D","E"]
    },
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ['technology', 'sports', 'education']
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    timeLimit:{
        type:Date,
        required:true,
        expires: 2 * 60 * 60 * 1000
    }
});

eventBase.static.allowCategory = eventBase.obj.category.enum;
eventBase.static.allowLocation = eventBase.obj.location.enum;

const EventBase = mongoose.model("EventBase", eventBase);
module.exports=EventBase;