const {Schema,model,mongoose}=require("mongoose")
const tokendetails=require("../service/token.js")
const { createHmac, randomBytes } = require("crypto");
const ApiError = require("../utils/ApiError.js");
const { type } = require("os");
const {UserError} = require("../utils/Constants/User.js");
/**
 * User Schema:
 * - name: The name of the user.
 * - email: The email address of the user, validated with a regex pattern.
 * - avatar: The image URL representing the user's avatar.   (later Include Default Avatar)
 * - password: The password for the user account (must be at least 8 characters).
 */

const user = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },
    avatar: {
        type: String,
        required: false,
        default:"../../public/images/profile.png"
    },
    salt:{
        type:String
    },
    branch:{
        type:String,
        required:false,
        trim:true,
        lowercase:true,
        index:true
    },
    role:{
        type:String,
        required:true,
        default:"user",
        index:true,
        enum: ["user","org"]
    },
    password: {
        type: String,
        required: true,
        minlength: 8 
    },
    sem:{
        type:Number,
        required:false,
    },
    rollno:{
        type:String,
        required:false,
        trim:true,
    },
    contactdetails:{
        type:Number,
        required:false,
    }
    
});

user.pre("save",function (next){
    const user=this;
    // auto generate branch from email
    this.branch = user.email.substring(2,4).toLowerCase();
    if(!user.isModified("password"))return;
    const salt=randomBytes(16).toString();
    
    const hashpassword = createHmac('sha256', salt)
               .update(user.password)
               .digest('hex');
    this.salt=salt;
    this.password=hashpassword;
    next();
});

user.static("matchPasswordAndGenerateToken",async function(email,password){
    const user=await this.findOne({email});
    if(!user){
        throw new ApiError(UserError.USER_NOT_FOUND);
    }

    const salt=user.salt;
    const originalpassword=user.password;
    const userPass=createHmac("sha256",salt).update(password).digest("hex");

    if(originalpassword!==userPass){
        throw new ApiError(UserError.PASSWORD_MISMATCH);
    }

    const token=tokendetails.createTokenForUser(user);
    return token;
});


// // Static method to find role and ID
// user.static("findRoleAndId", async function (filter) {
//     return this.find(filter).select("_id role").lean();
// });

user.statics.allowedRoles = user.obj.role.enum;
user.statics.emailPattern = /^\d{2}(it|ce|ec|ch)(uos|nsa)\d{3}@ddu\.ac\.in$/;
function getAllBranchFromPattern(emailPattern){
    const match = emailPattern.toString().match(/\((.*?)\)/);
  if (match && match[1]) {
    return match[1].split('|');
  }
  return [];
}

user.statics.Branches = getAllBranchFromPattern(user.statics.emailPattern);

const User = mongoose.model("User", user);
module.exports=User;