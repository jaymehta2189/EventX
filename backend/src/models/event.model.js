const {Schema,mongoose}=require("mongoose");
const User = require("./user.model");

const event = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true
    },
    avatar: {
        type: String,
        required: true,
        default:"https://res.cloudinary.com/dlswoqzhe/image/upload/v1736367840/Collaborative-Coding.-A-developer-team-working-together.-min-896x504_mnw9np.webp"
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    joinGroup:{
        type: Number,
        default:0
    },
    groupLimit: {
        type: Number,
        required: true,
        min: [1, 'Event:: {VALUE} must be a positive number'],
        validate: {
            validator: (value) => Number.isInteger(value),
            message: 'Event:: {VALUE} groupLimit must be an integer'
        }
    },
    userLimit: {
        type: Number,
        required: true,
        min: [1, 'Event:: {VALUE} must be a positive number'],
        validate: {
            validator: (value) => Number.isInteger(value),
            message: `Event::{VALUE} UserLimit must be an integer`
        }
    },
    allowBranch:[
        {
            type: String,
            required:false,
            enum: User.allowBranch
        }
    ],
    girlMinLimit:{
        type: Number,
        default:0,
        validate:{
            validator: (value) =>{
                return this.userLimit >= girlMinLimit;
            },
            message: `Event::{VALUE} girl Limit greater then user Limit`
        }
    },
    allowBranch:{
        type: [String],
        required:true,
        enum: [...User.Branches,'all']
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
        required: true,
        index: true,
        enum:['MMH','Seminar Hall','Center foyer','Canteen','Narayan Bhavan']
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
    winnerGroup:{
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: false
    },
    pricePool: {
        type: Number,
        required: true,
        min: [0, 'Event:: Prize pool must be a positive number'] // Ensure the prize pool is a positive number
    },
    timeLimit:{
        type:Date,
        required:true,
        expires: 2 * 24 * 60 * 60 * 1000
    }
});

// event.pre('save', async function (next) {
//     try {
//         this.timeLimit=new Date(this.endDate.getTime() + 2 * 24 * 60 * 60 * 1000);
//         next();
//     } catch (error) {
//         next(error); // Pass error to the next middleware
//     }
// });

event.statics.allowCategory = event.path('category').enumValues;
// event.static.allowLocation = event.obj.location.enum;
event.statics.allowLocation = event.path('location').enumValues;

event.statics.allowBranch = event.path('allowBranch').enumValues;

const Event = mongoose.model("Event", event);
module.exports=Event;