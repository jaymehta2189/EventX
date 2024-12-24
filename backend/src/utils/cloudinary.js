const cloudinary = require('cloudinary');
const fs = require('fs');
require('dotenv').config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' });

        return response.secure_url;

    } catch (error) {

        return null;
        
    }finally{
        fs.unlinkSync(localFilePath);
    }
};

exports.deleteOnCloudinary = async(CloudinaryFilePath)=>{
    try {
        if(!CloudinaryFilePath) return null;

        const response = await cloudinary.uploader.destroy(CloudinaryFilePath);

        if (response.result === 'not found') {
            return null;
        }

        return response;
        
    } catch (error) {
        return null;
    }
};