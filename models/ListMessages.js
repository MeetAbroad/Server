var mongoose = require('mongoose');

var ListMessagesSchema = new mongoose.Schema({
	uid1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	uid2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	lastmessage: { type: String, required: true },
	dateSent: { type: Date, default: Date.now },
	read: { type: Boolean, default: false },
	cid: { type: Number }
});

module.exports = mongoose.model('ListMessages', ListMessagesSchema);