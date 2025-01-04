const {Schema , mongoose} = require('mongoose');

const manage_se_join = new Schema({
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
    timeLimit: {
        type: Date,
        required: true,
        expires: 2 * 24 * 60 * 60 * 1000
    }
});

const Manage_SE_Join = mongoose.model("Manage_SE_Join", manage_se_join);
module.exports = Manage_SE_Join;