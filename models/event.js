var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
  name: String,
  host: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  webhookUrl: String,
  attendees: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
  address: String,
  date: Date
});

eventSchema.methods.addAttendee = function(user, cb) {
  if (!this.attendees.indexOf(user._id)) {
    this.attendees.push(user._id);
  }

  this.save(cb);
};

module.exports = mongoose.model('event', eventSchema);
