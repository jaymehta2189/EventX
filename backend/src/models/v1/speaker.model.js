const {Schema,mongoose}=require("mongoose");

const speaker = new Schema({
    name:{
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
        // required: true,
        trim: true
    }
});

const Speaker = mongoose.model("Speaker",speaker);
module.export = Speaker;