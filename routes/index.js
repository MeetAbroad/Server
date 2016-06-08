var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/client_views/index.html');
});

// Login and Registration
var User = mongoose.model('User');

router.post('/register', function(req, res, next){
	if(!req.body.email || !req.body.password
		|| !req.body.firstname || !req.body.lastname
		|| !req.body.origincountry || !req.body.origincity
		|| !req.body.destinationcountry|| !req.body.destinationcity
		|| !req.body.agree || !req.body.gender)
	{
		return res.status(400).json({message: 'Please fill out all fields.'});
	}

  // Anyone with the same e-mail?
  User.findOne({email: req.body.email}).exec(function (err, user){
        if (err) {
			return next(err);
		}
		
        if (user) {
			return res.status(400).json({message: 'A user with the same e-mail already exists.'});
		}
		
		var user = new User();

		user.email = req.body.email;
		user.firstname = req.body.firstname;
		user.lastname = req.body.lastname;
		user.origincountry = req.body.origincountry;
		user.origincity = req.body.origincity;
		user.destinationcountry = req.body.destinationcountry;
		user.destinationcity = req.body.destinationcity;
		user.age = req.body.age;
		user.picture = '';
	  	user.gender = req.body.gender;

		user.setPassword(req.body.password)

		user.save(function (err){
			if(err){ return next(err); }

			return res.json({token: user.generateJWT()})
		});
	});
});

router.post('/login', function(req, res, next){
  if(!req.body.email || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

// route for facebook authentication and login
// different scopes while logging in
router.get('/login/facebook', 
	passport.authenticate('facebook', { scope : 'email' }
));
 
// handle the callback after facebook has authenticated the user
router.get('/login/facebook/callback',
	passport.authenticate('facebook', {
		failureRedirect : '/'
	}),
	function(req, res, done) {

		User.findOne({ '_id': req.user._id }, function (err, doc){
			
			var jwt = doc.generateJWT();
			
			res.redirect('/#/facebook/' + jwt);
		});
});

// route for google authentication and login
// different scopes while logging in
router.get('/login/google',
	passport.authenticate('google', { scope : 'email' }
));

// handle the callback after google has authenticated the user
router.get('/login/google/callback',
	passport.authenticate('google', {
		failureRedirect : '/'
	}),
	function(req, res, done) {

		User.findOne({ '_id': req.user._id }, function (err, doc){

			var jwt = doc.generateJWT();

			res.redirect('/#/google/' + jwt);
		});
	});

	
// Mobile App route for facebook login
router.post('/mobile/facebook', function(req, res, next){
	if(!req.body.email || !req.body.first_name
		|| !req.body.gender || !req.body.last_name
		|| !req.body.id || !req.body.picture || !req.body.access_token)
	{
		return res.status(400).json({message: 'Please fill out all fields.'});
	}

	// find the user in the database based on their facebook id
	User.findOne({ 'fb.id' : req.body.id }, function(err, user) {

		// if there is an error, stop everything and return that
		// ie an error connecting to the database
		if (err)
		    return done(err);

		// if the user is found, then log them in
		if (user)
		{
			// Consider updating the profile picture!
			user.picture = req.body.picture.data.url ? req.body.picture.data.url : '';
			user.save();
				
			res.status(200).json({token: user.generateJWT()});
		}
		else
		{
			// User with the same e-mail already exists?
			User.findOne({email: req.body.email}).exec(function (err, user){
				if (err) {
					return done(err);
				}
				
				if (user) {
					return done(new Error('A user with the same e-mail already exists.')); 
				}
										
				 // if there is no user found with that facebook id, create them
				var newUser = new User();

				// set all of the facebook information in our user model
				newUser.fb.id    = req.body.id; // set the users facebook id	                
				newUser.fb.access_token = req.body.access_token; // we will save the token that facebook provides to the user	                

				newUser.email = req.body.email;
				newUser.firstname = req.body.first_name;
				newUser.lastname = req.body.last_name;
				
				// These are required so we must add something...
				newUser.origincountry = '__undefined__';
				newUser.origincity = '__undefined__';
				newUser.destinationcountry = '__undefined__';
				newUser.destinationcity = '__undefined__';
				newUser.age = '9999';
				newUser.picture = req.body.picture.data.url ? req.body.picture.data.url : '';

				// save our user to the database
				newUser.save(function(err) {
					if (err)
						return done(new Error('A problem occurred while saving the user details.')); 

					// if successful, return the new user
					return res.status(200).json({token: newUser.generateJWT()});
				});
			});
		}
	});
});
	
module.exports = router;
