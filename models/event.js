var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
  host: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  attendees: [String],
});

eventSchema.methods.addAttendee = function(user, cb) {
  if (!this.attendees.indexOf(user._id)) {
    this.attendees.push(user._id);
  }

  this.save(cb);
};

module.exports = mongoose.model('event', eventSchema);
