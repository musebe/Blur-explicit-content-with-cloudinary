// Import the v2 api and rename it to cloudinary
import { v2 as cloudinary } from "cloudinary";

// Initialize the sdk with cloud_name, api_key and api_secret
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const FOLDER_NAME = "explicit-videos/";

export const handleCloudinaryUpload = (path, transformation = []) => {
  // Create and return a new Promise
  return new Promise((resolve, reject) => {
    // Use the sdk to upload media
    cloudinary.uploader.upload(
      path,
      {
        // Folder to store video in
        folder: FOLDER_NAME,
        // Type of resource
        resource_type: "video",
        transformation,
      },
      (error, result) => {
        if (error) {
          // Reject the promise with an error if any
          return reject(error);
        }

        // Resolve the promise with a successful result
        return resolve(result);
      }
    );
  });
};

export const handleCloudinaryDelete = async (ids) => {
  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(
      ids,
      {
        resource_type: "video",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );
  });
};
