var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    email: { type: String, required: true, index: { unique: true } },
	hash: String,
	salt: String,

    firstname: { type: String, required: true },
    lastname: { type: String, required: true },

    origincountry: { type: String, required: true },
    origincity: { type: String, required: true },
	
    age: { type: Number, required: true },

    destinationcountry: { type: String, required: true },
    destinationcity: { type: String, required: true },
	
	interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }]
});

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        exp: parseInt(exp.getTime() / 1000),
    }, process.env.MYSECRET);
};

module.exports = mongoose.model('User', UserSchema);