const {Schema,model,mongoose}=require("mongoose")
const tokendetails=require("../service/token.js")
const { createHmac, randomBytes } = require("crypto");
const ApiError = require("../utils/ApiError.js");
const {UserError} = require("../utils/Constants/User.js");
const User = require("./user.model.js");

const authority = new Schema({
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
        default:"https://res.cloudinary.com/dlswoqzhe/image/upload/v1736455184/profile_lz6y2x.png"
    },
    salt:{
        type:String
    },
    isGoogleUser: {
        type: Boolean,
        default: false,
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
        index:true,
        enum: [ "staff","admin"]
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleUser;
        },
        minlength: 8 
    }
});

authority.pre("save",function (next){
    const authority=this;

    if (this.role == "staff") {
        this.branch = authority.email.match(/^[A-Za-z0-9]+(\.[A-Za-z]{2})@ddu\.ac\.in$/)[1].slice(1);
        console.log(this.branch);
    } else {
        this.branch = 'all';
    }

    if (this.isGoogleUser) {
        return next();
    } 

    if(!authority.isModified("password"))return;
    const salt=randomBytes(16).toString();
    
    const hashpassword = createHmac('sha256', salt)
               .update(authority.password)
               .digest('hex');
    this.salt=salt;
    this.password=hashpassword;
    next();
});

authority.static("matchPasswordAndGenerateToken",async function(email,password){
    const authority=await this.findOne({email});
    if(!authority){
        throw new ApiError(UserError.USER_NOT_FOUND);
    }
    if(authority.isGoogleUser){
        throw new ApiError(UserError.IS_GOOGLE_USER);
    }

    const salt=authority.salt;
    const originalpassword=authority.password;
    const userPass=createHmac("sha256",salt).update(password).digest("hex");

    if(originalpassword!==userPass){
        throw new ApiError(UserError.PASSWORD_MISMATCH);
    }

    const token=tokendetails.createTokenForUser(authority);
    return token;
});

authority.statics.allowedRoles = authority.obj.role.enum;

authority.statics.StaffEmailPattern = /^[A-Za-z0-9]+(\.[A-Za-z]{2})@ddu\.ac\.in$/;

authority.statics.GeneralPattern = /^[A-Za-z0-9]+(\.[A-Za-z]{2})?@ddu\.ac\.in$/;

authority.statics.Branches = User.Branches;

const Authority = mongoose.model("Authority", authority);
module.exports=Authority;