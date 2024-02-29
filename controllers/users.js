"use strict";

// Import files
const User = require("../models/user");
const Photo = require("../models/photo");

//////////////////////////////////////////////////////////////////////
// Show User
module.exports.showUser = async (req, res) => {
  // pagination
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.params.id).populate("images");
  const photos = await Photo.find({ author: user._id })
    .skip(skip)
    .limit(limit)
    .populate("author")
    .populate("likes")
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

  // if logged in, what photos have been liked
  if (req.isAuthenticated()) {
    for (let photo of photos) {
      const photoLikes = photo.likes.map((p) => p.author);
      const isLiked = photoLikes.some((objId) => objId.equals(req.user._id));
      photo.isLikedByCurrentUser = isLiked;
    }
  }
  res.render("users/show", { user, photos, page, limit });
};

//////////////////////////////////////////////////////////////////////
// Register Form
module.exports.registerForm = (req, res) => {
  res.render("users/register");
};

//////////////////////////////////////////////////////////////////////
// Register
module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next();
      req.flash("success", "Welcome to Analog Hub!");
      res.redirect("/photos");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

//////////////////////////////////////////////////////////////////////
// Login Form
module.exports.loginForm = (req, res) => {
  res.render("users/login");
};

//////////////////////////////////////////////////////////////////////
// Login
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/photos";
  res.redirect(redirectUrl);
};

//////////////////////////////////////////////////////////////////////
// Logout
module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/photos");
  });
};
