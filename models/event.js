var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
  host: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  url: String,
  attendees: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
  name: String,
  address: String,
  data: Date
});

eventSchema.methods.addAttendee = function(user, cb) {
  if (!this.attendees.indexOf(user._id)) {
    this.attendees.push(user._id);
  }

  this.save(cb);
};

module.exports = mongoose.model('event', eventSchema);
