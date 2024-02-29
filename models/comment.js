"use strict";

// Npm and files
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Model
const commentSchema = new Schema({
  text: String,
  author: String,
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  photoId: {
    type: Schema.Types.ObjectId,
    ref: "Photo",
  },
});

// Export
module.exports = mongoose.model("Comment", commentSchema);
