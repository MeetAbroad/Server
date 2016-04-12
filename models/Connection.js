var mongoose = require('mongoose');

var ConnectionSchema = new mongoose.Schema({
	uid1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	uid2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	accepted: { type: Boolean, default: false },
	dateSent: { type: Date, default: Date.now }
});

ConnectionSchema.index({uid1: 1, uid2: 1}, {unique: true});

module.exports = mongoose.model('Connection', ConnectionSchema);