const {Schema,model,mongoose}=require("mongoose")
const tokendetails=require("../service/token.js")
const { createHmac, randomBytes } = require("crypto");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { type } = require("os");
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
        unique: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Basic email regex
            },
            message: 'User:: {VALUE} is not a valid email!'
        }
    },
    avatar: {
        type: String,
        required: false,
        default:"../../public/images/profile.png"
    },
    salt:{
        type:String
    },
    role:{
        type:String,
        required:true,
        default:"user",
        enum:["user","admin","org"]
    },
    password: {
        type: String,
        required: [true, 'User:: Password is required'],
        minlength: 8 
    }
});

user.pre("save",function (next){
    const user=this;
    if(!user.isModified("password"))return;
    const salt=randomBytes(16).toString();
    
    const hashpassword = createHmac('sha256', salt)
               .update(user.password)
               .digest('hex');
    console.log(hashpassword);
    this.salt=salt;
    this.password=hashpassword;
    next();
});
user.static("matchPasswordAndGenerateToken",async function(email,password){
    const user=await this.findOne({email});
    if(!user)
        return false;

    const salt=user.salt;
    const originalpassword=user.password;
    const userPass=createHmac("sha256",salt).update(password).digest("hex");

    if(originalpassword!==userPass){
        throw new ApiError(401,"Password Not Valied");
    }

    const token=tokendetails.createTokenForUser(user);
    return token;
});


// // Static method to find role and ID
// user.static("findRoleAndId", async function (filter) {
//     return this.find(filter).select("_id role").lean();
// });

const User = mongoose.model("User", user);
module.exports=User;