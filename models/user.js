var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  facebookToken: String,
  facebookProfile: String,
  twitterToken: String,
  twitterProfile: String,
  pizzaNumber: Number,
});

module.exports = mongoose.model('user', userSchema);
