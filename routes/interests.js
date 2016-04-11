var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var auth = jwt({secret: process.env.MYSECRET, userProperty: 'payload'});

var Interest = mongoose.model('Interest');

router.get('/', auth, function(req, res, next) {
	Interest.find(function(err, interests){
		if(err){ return next(err); }

		res.json(interests);
	});
});

router.post('/update', auth, function(req, res, next) {
	
	var author = req.payload.email;
	
	var query = User.findOne({email: email});

    User.findOne({email: email}).exec(function (err, user){
        if (err) {
			res.status(401);
			res.json('User not found.');
		}
        if (!user) {
			res.status(401);
			res.json('User not found.');
		}

		// We found our user, so let's associate interests with it
		user.interests = [];
		user = req.body.interests;
		user.save(function(err, post) {
			if(err)
			{
				res.status(400);
				res.json('Could not save your interests.');
			}

			res.json('Interests updated successfully.');
		});
    });
});


router.post('/new', auth, function(req, res, next) {
  var interest = new Interest(req.body);

  interest.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

module.exports = router;
