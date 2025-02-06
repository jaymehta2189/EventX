const nodemailer = require("nodemailer");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

<<<<<<< HEAD
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

=======
let transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.MAIL_HOST,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

const mailSender = asyncHandler(async (email, title, body) => {
    try {
>>>>>>> main
        let info = await transporter.sendMail({
            from: 'EventX',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        return info;
    }
    catch (error) {
<<<<<<< HEAD
        throw new ApiError(404,error.message);
    }
});


module.exports = mailSender;
=======
        throw new ApiError(404, error.message);
    }
});

module.exports = { mailSender , transporter};
>>>>>>> main
