"use strict";

// dotenv for loading environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//////////////////////////////////////////////////////////////////////
// Npm modules
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

// Import files
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
const Photo = require("./models/photo");
const userRoutes = require("./routes/users");
const photoRoutes = require("./routes/photos");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");

//////////////////////////////////////////////////////////////////////
// MongoDB connection
// mongoose.connect(process.env.LOCAL_DB_URL); // local database
mongoose.connect(process.env.ATLAS_DB_URL); // atlas database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

// Express
const app = express();

// EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

//////////////////////////////////////////////////////////////////////
// Session configuration
const sessionConfig = {
  name: "session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, // https only
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
];

const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];

const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://ka-f.fontawesome.com",
];

const fontSrcUrls = [
  "https://fonts.gstatic.com",
  "https://ka-f.fontawesome.com",
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//////////////////////////////////////////////////////////////////////
// Home route
app.get("/", (req, res) => {
  res.render("main/home");
});

// Map route
app.get("/map", async (req, res) => {
  const photos = await Photo.find({}).populate("author");
  res.render("main/map", { photos });
});

// Route handlers
app.use("/photos", photoRoutes);
app.use("/photos/:id", likeRoutes);
app.use("/photos/:id/comments", commentRoutes);
app.use("/", userRoutes);

//////////////////////////////////////////////////////////////////////
// Error handling
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Oh no, something went wrong!" } = err;
  res.status(statusCode).render("main/error", { err: { message, statusCode } });
});

//////////////////////////////////////////////////////////////////////
// Server listening
app.listen(process.env.PORT, () => {
  console.log(`serving on port ${process.env.PORT}`);
});
