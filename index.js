require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const loginRoutes = require('./routes/loginRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const commonRoutes = require('./routes/commonRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js');
const productModel = require('./models/productModel.js');
const User = require('./models/usersModel.js');
const passport = require("passport");
const FacebookStrategy = require('passport-facebook').Strategy;
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-findorcreate');
const passportLocalMongoose = require("passport-local-mongoose");
const bodyParser = require("body-parser");
const FB = require("fb");
const methodOverride = require('method-override');
const { isLoggedIn } = require("./middleware.js");
const app = express();
const MongoDbStore = require('connect-mongo');
const dbURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/Test';


app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const store = MongoDbStore.create({
  mongoUrl: dbURL,
  secret: process.env.SECRET,
  touchAfter: 24 * 3600
});

store.on("error", function (e) {
  console.log("Session error:\n", e);
});


app.use(session({
  store,
  secret: process.env.SECRET || "Micul nostru secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.PROTOCOL + "://" + process.env.HOST + "/auth/facebook/secrets"
},
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      facebookId: profile.id
    }, function (err, user) {
      return cb(err, user);
    });
  }
));


FB.setAccessToken(process.env.FB_ACCESS_TOKEN);
app.use("/", loginRoutes);
app.use("/", commonRoutes);
app.use("/", commentRoutes);
app.use("/", productRoutes);


app.use('*', (req, res) => {
  res.render("../views/404.ejs");
})

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}...`)
})