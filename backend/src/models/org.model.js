// const {Schema,model,mongoose}=require("mongoose")
// const tokendetails=require("../service/token.js")
// const { createHmac, randomBytes } = require("crypto");
// const ApiError = require("../utils/ApiError.js");
// /**
//  * Org Schema:
//  * - name: The name of the organization.
//  * - email: The email address of the organization, validated with a regex pattern.
//  * - avatar: The image URL representing the organization's avatar. (later Include Default Avatar)
//  * - password: The password for the organization account (must be at least 8 characters).
//  */

// const org = new Schema({
//     name: {
//         type: String,
//         required: true,
//         lowercase: true,
//         trim: true
//     },
//     email: {
//         type: String,
//         required: true,
//         lowercase: true,
//         trim: true,
//         index: true,
//         unique: true,
//         validate: {
//             validator: function (value) {
//                 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//             },
//             message: 'Org:: {VALUE} is not a valid email!'
//         }
//     },
//     salt:{
//         type:String
//     },
//     avatar: {
//         type: String,
//         // required: true
//     },
//     password: {
//         type: String,
//         required: [true, 'Org:: Password is required'],
//         minlength: 8
//     }
// });



// user.pre("save",function (next){
//     const org=this;
//     if(!user.isModified("password"))return;
//     const salt=randomBytes(16).toString();
    
//     const hashpassword = createHmac('sha256', salt)
//                .update(user.password)
//                .digest('hex');
//     console.log(hashpassword);
//     this.salt=salt;
//     this.password=hashpassword;
//     next();
// });
// user.static("matchPasswordAndGenerateToken",async function(email,password){
//     const org=await this.findOne({email});
//     if(!org)
//         return false;

//     const salt=org.salt;
//     const originalpassword=org.password;
//     const orgPass=createHmac("sha256",salt).update(password).digest("hex");

//     if(originalpassword!==orgPass){
//         throw new ApiError(401,"Password Not Valied");
//     }

//     const token=tokendetails.createTokenForPerson(org);
//     return token;
// });


// const Org = mongoose.model("Org", org);
// module.exports=Org;