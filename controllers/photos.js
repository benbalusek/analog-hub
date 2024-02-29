"use strict";

// Import Files
const Photo = require("../models/photo");
const User = require("../models/user");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { getDate } = require("../utils/getDate");

//////////////////////////////////////////////////////////////////////
// Index
module.exports.index = async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const photos = await Photo.find({})
    .populate("author")
    .populate("likes")
    .skip(skip)
    .limit(limit)
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    .sort({ createdAt: -1 });

  // comments data for modal
  photos.forEach((photo) => {
    photo.commentsData = JSON.stringify(
      photo.comments.map((comment) => ({
        text: comment.text,
        author: comment.author,
        authorId: comment.authorId,
      }))
    );
  });

  if (req.isAuthenticated()) {
    for (let photo of photos) {
      const photoLikes = photo.likes.map((p) => p.author);
      const isLiked = photoLikes.some((objId) => objId.equals(req.user._id));
      photo.isLikedByCurrentUser = isLiked; // Add a new property to the photo
    }
  }
  res.render("photos/index", { photos, page: parseInt(page), limit });
};

//////////////////////////////////////////////////////////////////////
// New Photo Form
module.exports.newPhotoForm = (req, res) => {
  res.render("photos/new");
};

//////////////////////////////////////////////////////////////////////
// New Photo
module.exports.newPhoto = async (req, res, next) => {
  if (req.files.length > 10) {
    req.flash("error", "You can only upload up to 10 images");
    return res.redirect("/photos/new");
  }
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.photo.location,
      limit: 1,
    })
    .send();
  const photo = new Photo(req.body.photo);
  const user = await User.findById(req.user._id);
  photo.geometry = geoData.body.features[0].geometry;

  photo.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  photo.author = req.user._id;
  photo.date = new Date();
  await photo.save();
  user.images.push(photo);
  await user.save();
  req.flash("success", "Successfully made a post!");
  res.redirect(`/photos/${photo._id}`);
};

//////////////////////////////////////////////////////////////////////
// Show Photo
module.exports.showPhoto = async (req, res) => {
  const photos = await Photo.find({});
  const photo = await Photo.findById(req.params.id)
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    .populate("likes")
    .populate("author");

  if (!photo) {
    req.flash("error", "Cannot find that post!");
    return res.redirect("/photos");
  }

  photo.comments.reverse();

  const date = getDate(photo.date);
  let edit;
  if (photo.edited) {
    edit = "(edited)";
  }

  if (req.isAuthenticated()) {
    const photoLikes = photo.likes.map((p) => p.author);
    const isLiked = photoLikes.some((objId) => objId.equals(req.user._id));
    photo.isLikedByCurrentUser = isLiked;
  }
  res.render("photos/show", { photos, photo, edit, date });
};

//////////////////////////////////////////////////////////////////////
// Edit Photo Form
module.exports.editPhotoForm = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) {
    req.flash("error", "Cannot find that post!");
    return res.redirect("/photos");
  }
  res.render("photos/edit", { photo });
};

//////////////////////////////////////////////////////////////////////
// Edit Photo
module.exports.editPhoto = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.findByIdAndUpdate(id, { ...req.body.photo });

  if (req.body.photo.location !== photo.location) {
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.photo.location,
        limit: 1,
      })
      .send();
    photo.geometry = geoData.body.features[0].geometry;
    photo.location = req.body.photo.location;
  }

  photo.edited = true;
  await photo.save();
  req.flash("success", "Successfully edited post!");
  res.redirect(`/photos/${photo._id}`);
};

//////////////////////////////////////////////////////////////////////
// Delete Photo
module.exports.deletePhoto = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.findById(id);

  if (photo) {
    await Photo.findByIdAndDelete(id);
    await User.findByIdAndUpdate(req.user._id, { $pull: { images: id } });

    const deleteFromCloud = photo.images
      .filter((image) => !image.filename.startsWith("Film/"))
      .map((image) =>
        cloudinary.uploader.destroy(image.filename).catch((error) => {
          console.error("Failed to delete image:", image, error);
        })
      );
    await Promise.all(deleteFromCloud);
  }

  req.flash("success", "Successfully deleted post!");
  res.redirect("/photos");
};
