"use strict";

// Npm and files
const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, storeReturnTo } = require("../utils/middleware");
const likes = require("../controllers/likes");

// Routes
router.post("/", isLoggedIn, storeReturnTo, catchAsync(likes.likePhoto));

// Export
module.exports = router;
