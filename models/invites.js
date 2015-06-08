var mongoose = require('mongoose');

var inviteSchema = mongoose.Schema({
  event: {type: mongoose.Schema.Types.ObjectId, ref: 'event'},
});

module.exports = mongoose.model('invite', inviteSchema);
