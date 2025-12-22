const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload file to Cloudinary
const UploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "my_project",
        });

        // Delete local file after upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Ensure temp file is removed even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

module.exports = UploadOnCloudinary;
