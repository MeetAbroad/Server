var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var fbConfig = require('../fb.js');

module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : fbConfig.appID,
        clientSecret    : fbConfig.appSecret,
        callbackURL     : fbConfig.callbackUrl,
		enableProof: true,
		profileFields: ['id', "first_name", "gender", "last_name", "email"]
    },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
	        User.findOne({ 'fb.id' : profile.id }, function(err, user) {

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
	                return done(null, user); // user found, return that user
	            } else {
					
					// User with the same e-mail already exists?
					User.findOne({email: profile.emails[0].value}).exec(function (err, user){
						if (err) {
							return done(err);
						}
						
						if (user) {
							return done(new Error('A user with the same e-mail already exists.')); 
						}
												
						 // if there is no user found with that facebook id, create them
						var newUser = new User();

						// set all of the facebook information in our user model
						newUser.fb.id    = profile.id; // set the users facebook id	                
						newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user	                

						newUser.email = profile.emails[0].value;
						newUser.firstname = profile.name.givenName;
						newUser.lastname = profile.name.familyName;
						
						// These are required so we must add something...
						newUser.origincountry = '__undefined__';
						newUser.origincity = '__undefined__';
						newUser.destinationcountry = '__undefined__';
						newUser.destinationcity = '__undefined__';
						newUser.age = '9999';

						// save our user to the database
						newUser.save(function(err) {
							if (err)
								return done(new Error('A problem occurred while saving the user details.')); 

							// if successful, return the new user
							return done(null, newUser);
						});
					});
	            }

	        });
        });

    }));
};