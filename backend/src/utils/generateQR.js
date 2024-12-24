const QRCode = require('qrcode');
const path = require('path');
const cloudinary = require('./cloudinary');

exports.generateQRAndSaveAtCloudinary = async (data) => {
    try {
        const qrCodePath = path.join(__dirname, `../../public/qrcodes/${Date.now()}.png`);
        await QRCode.toFile(qrCodePath, data);
        return await cloudinary.uploadOnCloudinary(qrCodePath);
    } catch (error) {
        return null;
    }
};
