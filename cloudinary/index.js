"use strict";

// Npm modules
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "AnalogHub",
    allowedFormats: ["jpeg", "jpg", "png"],
  },
});

// Export
module.exports = {
  cloudinary,
  storage,
};
