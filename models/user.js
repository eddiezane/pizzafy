var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  email: {type: String, unique: true, lowercase: true},
  passwordHash: String,

  profile: {
    displayName: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    pizzaNumber: Number,
  },

  facebook: String,
  twitter: String,

  tokens: Array,
});

module.exports = mongoose.model('user', userSchema);
