"use strict";

// Import files
const ExpressError = require("./ExpressError");
const { photoSchema, commentSchema } = require("./schemas");
const Photo = require("../models/photo");
const Comment = require("../models/comment");

//////////////////////////////////////////////////////////////////////
// Is Logged In
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.originalUrl.match(/\/comments$/)) {
      req.session.returnTo = req.originalUrl.replace(/\/comments$/, "");
    } else {
      req.session.returnTo = req.originalUrl;
    }
    req.flash("error", "you must be signed in");
    return res.redirect("/login");
  }
  next();
};

//////////////////////////////////////////////////////////////////////
// Store Return To
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

//////////////////////////////////////////////////////////////////////
// Validate Photo
module.exports.validatePhoto = (req, res, next) => {
  const { error } = photoSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//////////////////////////////////////////////////////////////////////
// Is Author
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const photo = await Photo.findById(id);
  if (!photo.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/photos/${id}`);
  }
  next();
};

//////////////////////////////////////////////////////////////////////
// Is Comment Author
module.exports.isCommentAuthor = async (req, res, next) => {
  const { id, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment.authorId.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/photos/${id}`);
  }
  next();
};

//////////////////////////////////////////////////////////////////////
// Validate Comment
module.exports.validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
