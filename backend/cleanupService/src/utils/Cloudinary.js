const cloudinary = require('cloudinary').v2;

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteFiles = async (...publicIds) => {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
        console.log('No files to delete');
        return;
    }

    try {
        await cloudinary.api.delete_resources(publicIds);
        console.log('Files deleted successfully');
    } catch (error) {
        console.error('Error deleting files:', error);
    }
};

module.exports = deleteFiles;