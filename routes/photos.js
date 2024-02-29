"use strict";

// Npm and files
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validatePhoto } = require("../utils/middleware");
const photos = require("../controllers/photos");

//////////////////////////////////////////////////////////////////////
// Routes
router
  .route("/")
  .get(catchAsync(photos.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validatePhoto,
    catchAsync(photos.newPhoto)
  );

router.get("/new", isLoggedIn, photos.newPhotoForm);

router
  .route("/:id")
  .get(catchAsync(photos.showPhoto))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validatePhoto,
    catchAsync(photos.editPhoto)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(photos.deletePhoto));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(photos.editPhotoForm));

//////////////////////////////////////////////////////////////////////
// Export
module.exports = router;
