"use strict";

// dotenv for loading environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Npm and files
const mongoose = require("mongoose");
const cities = require("./cities");
const Photo = require("../models/photo");
const User = require("../models/user");
const Comment = require("../models/comment");
const Like = require("../models/like");
const { adjective, noun } = require("./seedHelpers");
const { cloudinary } = require("../cloudinary/index.js");

//////////////////////////////////////////////////////////////////////
// MongoDB connection
// mongoose.connect(process.env.LOCAL_DB_URL); // local database
mongoose.connect(process.env.ATLAS_DB_URL); // atlas database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

//////////////////////////////////////////////////////////////////////
// Seed database
// const userId = process.env.LOCAL_USER_ID; // local database
const userId = process.env.ATLAS_USER_ID; // atlas database
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  const photos = await Photo.find({});

  // Delete from cloudinary
  for (let image of photos.map((photo) => photo.images).flat()) {
    if (!image.filename.startsWith("Film/")) {
      try {
        const result = await cloudinary.uploader.destroy(image.filename);
        console.log(`Deleted: ${image.filename}`, result);
      } catch (error) {
        console.error("Failed to delete image:", image.filename, error);
      }
    }
  }

  // Delete all photos, comments, and likes
  await Photo.deleteMany({});
  await Comment.deleteMany({});
  await Like.deleteMany({});

  // Remove all photos, comments, and likes from all users
  await User.updateMany({}, { $set: { images: [] } });
  await User.updateMany({}, { $set: { comments: [] } });
  await User.updateMany({}, { $set: { likes: [] } });

  for (let i = 0; i < 100; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const random150 = Math.floor(Math.random() * 150) + 1;
    const random1502 = Math.floor(Math.random() * 150) + 1;
    const date = new Date();

    // Random Photo
    const photo = new Photo({
      author: userId,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(adjective)} ${sample(noun)}`,
      description: `${sample(adjective).toLowerCase()}, ${sample(
        adjective
      ).toLowerCase()} ${sample(noun).toLowerCase()}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1702069435/Film/filmphoto-${random150}.jpg`,
          filename: `Film/filmphoto-${random150}`,
        },
        {
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1702069435/Film/filmphoto-${random1502}.jpg`,
          filename: `Film/filmphoto-${random1502}`,
        },
      ],
      date,
      edited: false,
    });

    // Add photo to User
    const user = await User.findById(userId);
    user.images.push(photo);

    await user.save();
    await photo.save();
  }
};

//////////////////////////////////////////////////////////////////////
seedDB().then(() => {
  mongoose.connection.close();
});
