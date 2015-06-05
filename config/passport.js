var passport         = require('passport');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;

// passport.use(new FacebookStrategy({
  // clientID: FACEBOOK_APP_ID,
  // clientSecret: FACEBOOK_APP_SECRET,
  // callbackURL: "http://localhost:3000/auth/facebook/callback",
  // enableProof: false
// }, function(accessToken, refreshToken, profile, done) {
  // // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
  // // return done(err, user);
  // // });
  // console.log(profile);
  // done(null, 'test');
// }));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
}, function(token, tokenSecret, profile, done) {
  // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    // return done(err, user);
  // });
  console.log('twitter token', token);
  console.log(profile);
  done(null, 'test');
}));
