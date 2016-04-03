var mongoose = require('mongoose');

var InterestSchema = new mongoose.Schema({
    codename: { type: String, required: true, index: { unique: true } },
    title: { type: String, required: true },
    description: { type: String, required: true },
});

module.exports = mongoose.model('Interest', InterestSchema);