const multer = require("multer");
const { Readable } = require("stream");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bufferToStream = (buffer: any) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const uploadToCloudinary = async (file: { buffer: any }) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || "uploads" }, // Specify the folder in Cloudinary
      (
        error: { message: any },
        result: { public_id: any; secure_url: any; original_filename: any },
      ) => {
        if (error) {
          reject(
            new Error(`Error uploading file to Cloudinary: ${error.message}`),
          );
        } else {
          resolve({
            id: result.public_id,
            url: result.secure_url,
            name: result.original_filename,
          });
        }
      },
    );

    bufferToStream(file.buffer).pipe(uploadStream);
  });
};
const deleteFileByUrl = async (fileUrl: string) => {
  try {
    // Extract public_id from the URL
    const urlParts = fileUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split(".")[0]; // Remove the extension

    // Delete the file by public_id
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error: any) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
};
module.exports = { upload, uploadToCloudinary, deleteFileByUrl };
