"use strict";

// Import files
const Photo = require("../models/photo");
const Comment = require("../models/comment");
const User = require("../models/user");

//////////////////////////////////////////////////////////////////////
// Create Comment
module.exports.createComment = async (req, res) => {
  const photo = await Photo.findById(req.params.id);

  const comment = new Comment({
    ...req.body.comment,
    author: req.user.username,
    authorId: req.user._id,
    photoId: photo._id,
  });
  await comment.save();

  const user = await User.findById(req.user._id);

  photo.comments.push(comment);
  user.comments.push(comment);
  await photo.save();
  await user.save();

  const commentResponse = {
    text: comment.text,
    author: user.username,
    authorId: user._id,
  };

  // Check if the request is AJAX
  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    res.json({ success: true, comment: commentResponse });
  } else {
    req.flash("success", "Comment posted!");
    res.redirect(`/photos/${req.params.id}`);
  }
};

//////////////////////////////////////////////////////////////////////
// Delete Comment
module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  await Photo.findByIdAndUpdate(id, { $pull: { comments: commentId } });
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { comments: commentId },
  });
  await Comment.findByIdAndDelete(commentId);
  req.flash("success", "Comment deleted!");
  res.redirect(`/photos/${id}`);
};
