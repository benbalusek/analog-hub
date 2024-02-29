"use strict";

// Import Files
const Photo = require("../models/photo");
const Like = require("../models/like");

//////////////////////////////////////////////////////////////////////
// Like Photo
module.exports.likePhoto = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const photo = await Photo.findById(id);
  if (!user) {
    return res.redirect("/login");
  }

  const existingLike = await Like.findOne({
    author: user._id,
    photoId: photo._id,
  });

  if (!existingLike) {
    const like = new Like({ author: user._id, photoId: photo._id });
    await like.save();
    photo.likes.push(like._id);
    user.likes.push(like._id);
  } else {
    await Like.findByIdAndDelete(existingLike._id);
    photo.likes.pull(existingLike._id);
    user.likes.pull(existingLike._id);
  }
  await Promise.all([photo.save(), user.save()]);

  await photo.populate("likes");

  res.json({
    updatedLikeCount: photo.likes.length,
    isLiked: !existingLike,
  });
};
