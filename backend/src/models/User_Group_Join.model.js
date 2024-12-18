import mongoose ,{Schema} from "mongoose";

const user_group_join = new Schema({
    Group:{
        type: Schema.Types.ObjectId,
        ref:"Group"
    },
    Member:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});

export const User_Group_Join = mongoose.model("User_Group_Join",user_group_join);