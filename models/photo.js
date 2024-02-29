"use strict";

// Npm and files
const mongoose = require("mongoose");
const { Schema } = mongoose;
const Comment = require("./comment");
const Like = require("./like");
const User = require("./user");

//////////////////////////////////////////////////////////////////////
// Model
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const opts = {
  toJSON: { virtuals: true },
  timestamps: true,
};
const PhotoSchema = new Schema(
  {
    images: [ImageSchema],
    title: String,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    date: String,
    edited: Boolean,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
  },
  opts
);

//////////////////////////////////////////////////////////////////////
// Virtuals
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

PhotoSchema.virtual("properties.popUp").get(function () {
  return `<strong><a href="/photos/${this._id}">${this.title}</a></strong>
  <p>${this.location}</p>`;
});

PhotoSchema.post("findOneAndDelete", async function (photo) {
  if (photo) {
    const likes = await Like.find({ _id: { $in: photo.likes } });
    await Comment.deleteMany({ _id: { $in: photo.comments } });
    await Like.deleteMany({ _id: { $in: photo.likes } });

    for (const like of likes) {
      await User.findByIdAndUpdate(like.author, { $pull: { likes: like._id } });
    }
    for (const commentId of photo.comments) {
      await User.updateMany({}, { $pull: { comments: commentId } });
    }
  }
});

//////////////////////////////////////////////////////////////////////
// Export
module.exports = mongoose.model("Photo", PhotoSchema);
