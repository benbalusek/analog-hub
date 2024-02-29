"use strict";

// Npm and files
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//////////////////////////////////////////////////////////////////////
// Model
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: "Photo",
    },
  ],
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
});

UserSchema.plugin(passportLocalMongoose);

//////////////////////////////////////////////////////////////////////
// Export
module.exports = mongoose.model("User", UserSchema);
