var passport         = require('passport');
var mongoose         = require('mongoose');
var User             = require('../models/user.js');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_OAUTH_CALLBACK,
  enableProof: false
}, function(accessToken, refreshToken, profile, done) {
  // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    // return done(err, user);
  // });
  done(null, profile);
}));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_OAUTH_CALLBACK
}, function(token, tokenSecret, profile, done) {
  // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    // return done(err, user);
  // });
  done(null, profile);
}));

exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) return next();
      res.redirect('/login');
};
