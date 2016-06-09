var mongoose = require('mongoose');

var MessagesSchema = new mongoose.Schema({
	uid1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	uid2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	message: { type: String, required: true },
	dateSent: { type: Date, default: Date.now },
	read: { type: Boolean, default: false },
});

MessagesSchema.index({uid1: 1, uid2: 1}, {unique: true});

module.exports = mongoose.model('Messages', MessagesSchema);