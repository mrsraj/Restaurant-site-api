const AppError = require('../../utils/app-error');
const uploadOnCloudinary = require("../../integrations/cloudinary");
const createUpload = async (input = {}, context = {}) => {
  try {
    const localFilePath = context.file?.path;
    if (!localFilePath) {
      throw new AppError(400, {
        message: "File not found"
      });
    }
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (!cloudinaryResponse) {
      throw new AppError(500, {
        message: "Upload failed"
      });
    }
    return {
      message: "Upload successful",
      url: cloudinaryResponse.secure_url,
      public_id: cloudinaryResponse.public_id
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, {
      message: "Something went wrong",
      error: error.message
    });
  }
};
module.exports = createUpload;
