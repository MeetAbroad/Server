var mongoose = require('mongoose');
var local = require('./local');
var facebook = require('./facebook');
var google = require('./google');
var User = mongoose.model('User');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');
		console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            console.log('deserializing user:',user);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Facebook and Twitter | twitter?? local, no?
    //adding google
    facebook(passport);
    google(passport);
    local(passport);

}