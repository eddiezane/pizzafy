var mongoose = require('mongoose');
var crypto   = require('crypto');
var bcrypt   = require('bcrypt');

var userSchema = mongoose.Schema({
  email: {type: String, lowercase: true},
  password: String,

  profile: {
    displayName: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    picture: String,
  },

  pizza: {
    pizzaNumber: Number,
    toppings: Array,
    hates: Array,
    crust: String,
    dietary: Array,
    notes: String
  },

  facebookId: String,
  facebookToken: String,

  twitterId: String,
  twitterToken: String
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      console.log('AFTER HASH');
      if (err) {
        console.error('HASHING ERROR', err);
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.gravatar = function(size) {
  if (!size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

module.exports = mongoose.model('user', userSchema);
