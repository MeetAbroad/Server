var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var User = mongoose.model('User');
var auth = jwt({secret: process.env.MYSECRET, userProperty: 'payload'});

router.get('/', function(req, res, next) {
  User.find(function(err, users){
    if(err){ return next(err); }

    res.json(users);
  });
});

// Get user data
router.get('/:email', function(req, res, next) {
	
	var email = req.params.email;
	
    User.findOne({email: email}).exec(function (err, user){
        if (err) {
			return next(err);
		}
        if (!user) {
			return next('User not found');
		}
		
		// Of course, we don't want to send out sensitive information though, only some fields

        req.user = {};
		req.user.email = user.email;
		req.user.firstname = user.firstname;
		req.user.lastname = user.lastname;
		req.user.origincountry = user.origincountry;
		req.user.origincity = user.origincity;
		req.user.destinationcountry = user.destinationcountry;
		req.user.destinationcity = user.destinationcity;
		req.user.age = user.age;
		
		res.json(req.user);
    });
});


router.post('/update', auth, function(req, res, next) {
	
	var email = req.payload.email;
	
    User.findOne({email: email}).exec(function (err, user){
        if (err) {
			/*res.status(401);
			res.json('User not found.');*/
			return next('User not found.');
		}
        if (!user) {
			/*res.status(401);
			res.json('User not found.');*/
			return next('User not found.');
		}

		user.firstname = req.body.firstname;
		user.lastname = req.body.lastname;
		user.age = req.body.age;
		user.origincountry = req.body.origincountry;
		user.origincity = req.body.origincity;
		user.destinationcountry = req.body.destinationcountry;
		user.destinationcity = req.body.destinationcity;
		
		user.save(function(err, post) {
			if(err)
			{
				/*res.status(400);
				res.json('Could not save your interests.');*/
				return next('Could not save your options.');
			}

			res.json({message: 'Options updated successfully.'});
		});
    });
});

module.exports = router;
