var mongoose = require('mongoose');

var MessagesSchema = new mongoose.Schema({
	uid1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	uid2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	message: { type: String, required: true },
	dateSent: { type: Date, default: Date.now },
	read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Messages', MessagesSchema);