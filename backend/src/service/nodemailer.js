const nodemailer = require("nodemailer");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const mailSender = asyncHandler (async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await transporter.sendMail({
            from: 'EventX',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        return info;
    }
    catch (error) {
        throw new ApiError(404,error.message);
    }
});


module.exports = mailSender;