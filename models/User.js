var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },

    firstname: { type: String, required: true },
    lastname: { type: String, required: true },

    origincountry: { type: String, required: true },
    origincity: { type: String, required: true },

    destinationcountry: { type: String, required: true },
    destinationcity: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);