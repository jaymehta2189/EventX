const mongoose = require("mongoose");
const mailSender = require("../service/nodemailer");
const emailTemplate = require("../service/emailTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    }
});

async function sendVerificationEmail(email, otp) {
    
    try {
        await mailSender(
            email,
            "Verification Email",
            emailTemplate(otp)
        );
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function (next) {

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports=OTP;