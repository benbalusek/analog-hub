"use strict";

// Npm and files
const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../utils/middleware");
const users = require("../controllers/users");

//////////////////////////////////////////////////////////////////////
// Routes
router
  .route("/register")
  .get(users.registerForm)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.loginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

router.get("/:id", catchAsync(users.showUser));

//////////////////////////////////////////////////////////////////////
// Export
module.exports = router;
