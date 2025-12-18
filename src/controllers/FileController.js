const uploadOnCloudinary = require("../Utility/Cloudinary");

const FileUploadController = async (req, res) => {
    try {
        const localFilePath = req.file?.path;

        if (!localFilePath) {
            return res.status(400).json({ message: "File not found" });
        }

        const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

        if (!cloudinaryResponse) {
            return res.status(500).json({ message: "Upload failed" });
        }

        return res.status(200).json({
            message: "Upload successful",
            url: cloudinaryResponse.secure_url,
            public_id: cloudinaryResponse.public_id,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};

module.exports = FileUploadController;
