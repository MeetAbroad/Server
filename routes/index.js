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

module.exports = router;
