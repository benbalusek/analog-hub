"use strict";

// Npm and files
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Model
const likeSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  photoId: {
    type: Schema.Types.ObjectId,
    ref: "Photo",
  },
});

// Export
module.exports = mongoose.model("Like", likeSchema);
