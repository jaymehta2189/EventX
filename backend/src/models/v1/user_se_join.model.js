const { Schema, mongoose } = require('mongoose');

const user_se_join = new Schema({
    SimpleEvent: {
        type: Schema.Types.ObjectId,
        ref: "SimpleEvent",
        required: true,
        index: true,
        unique: true
    },
    Member: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    isPresent: {
        type: Boolean,
        default: false
    },
    timeLimit: {
        type: Date,
        required: true,
        expires: 2 * 24 * 60 * 60 * 1000
    }
});

const User_SE_Join = mongoose.model("User_SE_Join", user_se_join);
module.exports = User_SE_Join;