import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  // these value should be in env but for now
  cloud_name: "nodeupload",
  api_key: "212195956387544",
  api_secret: "6uMoveJNXFXfiZ0bU8xtkOKAXSQ",
});

const uploadOnCloudnary = async (filepath) => {
  try {
    if (!filepath) return null;
    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });
    console.log("Successfully uploaded on cloudnary", response);
    return response.url;
  } catch (error) {
    fs.unlinkSync(filepath); // remove local saved file on server side
    console.log("Error uploading on cloudnary", error);
    return null;
  }
};

export { uploadOnCloudnary };
