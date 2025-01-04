const {Schema,model,mongoose}=require("mongoose")

const user_group_join = new Schema({
    Group:{
        type: Schema.Types.ObjectId,
        ref:"Group",
        required:[true,"Group is required"],
    },
    Member:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Member is required"],
        index:true
    },
    timeLimit:{
        type:Date,
        required:true,
        expires: 2 * 24 * 60 * 60 * 1000
    }
});

// user_group_join.pre('save', async function (next) {
//     try {
//         const endDate = await Group.findById(this.Group).select('endDate').exec();
//         this.timeLimit=new Date(this.endDate.getTime() + 2 * 24 * 60 * 60 * 1000);
//         next();
//     } catch (error) {
//         next(error); // Pass error to the next middleware
//     }
// });

const User_Group_Join = mongoose.model("User_Group_Join",user_group_join);
module.exports=User_Group_Join;