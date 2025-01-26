const {Schema,mongoose}=require("mongoose");

const user_event_join = new Schema({
    Event:{
        type: Schema.Types.ObjectId,
        ref:"Event",
        required:[true,"Event is required"],
    },
    Member:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Member is required"]
    }
});

const User_Event_Join = mongoose.model("User_Event_Join",user_event_join);
module.exports=User_Event_Join;