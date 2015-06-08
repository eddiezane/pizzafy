var passport           = require('passport');
var mongoose           = require('mongoose');
var User               = require('../models/user.js');
var LocalStrategy      = require('passport-local').Strategy;
var FacebookStrategy   = require('passport-facebook').Strategy;
var MeetupStrategy     = require('passport-meetup').Strategy;
var EventbriteStrategy = require('passport-eventbrite-oauth').OAuth2Strategy;
// var TwitterStrategy  = require('passport-twitter').Strategy;

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

// passport.use(new TwitterStrategy({
  // consumerKey: process.env.TWITTER_CONSUMER_KEY,
  // consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  // callbackURL: process.env.TWITTER_OAUTH_CALLBACK
// }, function(token, tokenSecret, profile, done) {
  // User.findOne({twitterId: profile.id}, function (err, user) {
    // if (err) return console.error(err);

    // if (user) {
      // return done(err, user);
    // } else {

      // User.create({
        // profile: {
          // displayName: profile.displayName,
          // firstName: profile.firstName,
          // lastName: profile.lastName,
          // picture: profile.picture || profile._json.profile_image_url_https
        // },

        // twitterId: profile.id,
        // twitterToken: token,
        // twitterTokenSecret: tokenSecret

      // }, function(err, user) {
        // return done(err, user);
      // });
    // }
  // });
  // done(null, profile);
// }));

passport.use(new LocalStrategy({usernameField: 'email'}, function(email, password, done) {
  email = email.toLowerCase();
  User.findOne({email: email}, function(err, user) {
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));

passport.use(new MeetupStrategy({
  consumerKey: process.env.MEETUP_OAUTH_KEY,
  consumerSecret: process.env.MEETUP_OAUTH_SECRET,
  callbackURL: process.env.MEETUP_OAUTH_CALLBACK
}, function(token, tokenSecret, profile, done) {
  User.findOne({meetupId: profile.id}, function (err, user) {
    if (err) return console.error(err);

    if (user) {
      return done(err, user);
    } else {

      var picture = JSON.parse(profile._raw).results[0].photo.photo_link;

      User.create({

        profile: {
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          picture: picture,
        },
        
        meetupId: profile.id,
        meetupToken: token,
        meetupTokenSecret: tokenSecret

      }, function(err, user) {
        return done(err, user);
      });
    }
  });
}));

passport.use(new EventbriteStrategy({
  clientID: process.env.EVENTBRITE_CLIENT_ID,
  clientSecret: process.env.EVENTBRITE_CLIENT_SECRET,
  callbackURL: process.env.EVENTBRITE_CALLBACK
}, function(accessToken, refreshToken, profile, done) {
  User.findOne({eventbriteId: profile.id}, function (err, user) {
    if (err) return console.error(err);

    if (user) {
      return done(err, user);
    } else {
      console.log(profile);

      User.create({

        profile: {
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
        },

        // picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large'

        eventbriteId: profile.id,
        eventbriteToken: accessToken

      }, function(err, user) {
        return done(err, user);
      });
    }
  });
}));

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/login');
};
