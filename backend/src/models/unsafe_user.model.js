const {Schema,mongoose}=require("mongoose")
const tokendetails=require("../service/token.js")
const { createHmac, randomBytes } = require("crypto");
const ApiError = require("../utils/ApiError.js");
const {UnSafeUserError , UnSafeUserSuccess} =  require("../utils/Constants/UnSafe_User.js");

const unsafe_user = new Schema({
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
    salt:{
        type:String
    },
    branch:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        index:true
    },
    role:{
        type:String,
        required:true,
        index:true,
        enum: ["org", "hod"]
    },
    password: {
        type: String,
        required: true,
        minlength: 8 
    }
});

unsafe_user.pre("save",function (next){
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

unsafe_user.static("matchPasswordAndGenerateToken",async function(email,password){
    const unsafe_user_t=await this.findOne({email});
    if(!unsafe_user_t){
        throw new ApiError(UnSafeUserError.UNSAFE_USER_NOT_FOUND);
    }

    const salt=unsafe_user_t.salt;
    const originalpassword=unsafe_user_t.password;
    const userPass=createHmac("sha256",salt).update(password).digest("hex");

    if(originalpassword!==userPass){
        throw new ApiError(UnSafeUserError.PASSWORD_MISMATCH);
    }

    const token=tokendetails.createTokenForUser(unsafe_user_t);
    return token;
});

const Unsafe_User =  mongoose.model("Unsafe_User", unsafe_user);
module.exports = Unsafe_User;