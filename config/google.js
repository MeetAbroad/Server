var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var ggConfig = require('../gg.js');

module.exports = function(passport) {

    passport.use('google', new GoogleStrategy({
        clientID        : ggConfig.clientID,
        clientSecret    : ggConfig.clientSecret,
        callbackURL     : ggConfig.callbackURL,
		/*enableProof: true,
		profileFields: ['id', "first_name", "gender", "last_name", "email", "photos"]*/
    },

    // google will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
	        User.findOne({ 'google.id' : profile.id }, function(err, user) {

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
					// Consider updating the profile picture!
					user.picture = profile.photos ? profile.photos[0].value : '';
					user.save();
					
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
												
						 // if there is no user found with that google id, create them
						var newUser = new User();

						// set all of the facebook information in our user model
						newUser.google.id    = profile.id; // set the users facebook id
						newUser.google.access_token = access_token; // we will save the token that facebook provides to the user

						newUser.email = profile.emails[0].value;
						newUser.firstname = profile.displayName;
						//newUser.lastname = profile.name.familyName;
						
						// These are required so we must add something...
						newUser.lastname = 'López';
						newUser.origincountry = '__undefined__';
						newUser.origincity = '__undefined__';
						newUser.destinationcountry = '__undefined__';
						newUser.destinationcity = '__undefined__';
						newUser.age = '9999';
						newUser.picture = profile.photos ? profile.photos[0].value : '';

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