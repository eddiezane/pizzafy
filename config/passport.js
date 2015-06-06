var passport         = require('passport');
var mongoose         = require('mongoose');
var User             = require('../models/user.js');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_OAUTH_CALLBACK,
  enableProof: false
}, function(accessToken, refreshToken, profile, done) {
  User.findOne({facebookId: profile.id}, function (err, user) {
    if (err) return console.error(err);

    if (user) {
      console.log('user!!', user);
      return done(err, user);
    } else {

      User.create({

        profile: {
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large'
        },

        facebookId: profile.id,
        facebookToken: accessToken

      }, function(err, user) {
        return done(err, user);
      });
    }
  });
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



passport.use(new LocalStrategy(
  function(email, password, done) {
    console.log('insside local auth');
    User.findOne({email: email}, function (err, user) {
      console.log('user', user);
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/login');
};
