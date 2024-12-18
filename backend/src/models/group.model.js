const {Schema,model,mongoose}=require("mongoose")

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
        lowercase: true,
        trim: true,
        index: true
    },
    score: {
        type: Number,
        default: 0, // Default score value
        min: [0, 'Score must be a positive number'],
        max: [100, 'Score cannot exceed 100'],
        required: true //optional
    },
    groupLeader: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    qrCode:{
        type:String,
        required: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event"
    }
});

 const Group = mongoose.model("Group", group);
 module.exports=Group;