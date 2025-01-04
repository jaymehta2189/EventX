const {Schema,model,mongoose}=require("mongoose")
const { generateQRAndSaveAtCloudinary } = require("../utils/generateQR");

/**
 * Group Schema:
 * - name: The unique name of the group.
 * - score: The group's score in the event, ranging from 0 to 100. Default value is 0.
 * - groupLeader: The user who is the leader of the group (references to the User model).
 * - members: An array of users who are members of the group (references to the User model).
 * - qrCode: The image URL representing the QR.
 * - event: The event in which the group participates (references to the Event model).
 */

const group = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    score: {
        type: Number,
        default: 0,
        min: [0, 'Score must be a positive number'],
        max: [100, 'Score cannot exceed 100'],
        required: true
    },
    groupLeader: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    qrCode:{
        type:String
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        index: true
    },
    timeLimit:{
        type:Date,
        required:true,
        expires: 2 * 24 * 60 * 60 * 1000
    }
});

group.pre('save', async function (next) {
    // Logic to generate QR code
    try{
        this.qrCode = await generateQRAndSaveAtCloudinary(`http://localhost:${process.env.PORT}/api/group/qr/${this._id}`);
    }catch(error){
        throw new ApiError(GroupError.QR_CODE_GENERATION_FAILED);
    }
    next();
});

 const Group = mongoose.model("Group", group);
 module.exports=Group;