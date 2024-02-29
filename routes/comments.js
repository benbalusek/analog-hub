"use strict";

// Npm and files
const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {
  validateComment,
  isLoggedIn,
  isCommentAuthor,
} = require("../utils/middleware");
const comments = require("../controllers/comments");

//////////////////////////////////////////////////////////////////////
// Routes
router.post(
  "/",
  isLoggedIn,
  validateComment,
  catchAsync(comments.createComment)
);

router.delete(
  "/:commentId",
  isLoggedIn,
  isCommentAuthor,
  catchAsync(comments.deleteComment)
);

//////////////////////////////////////////////////////////////////////
// Export
module.exports = router;
