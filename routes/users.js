var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');
var multer = require('multer');

var User = mongoose.model('User');
var auth = jwt({secret: process.env.MYSECRET, userProperty: 'payload'});

/*router.get('/', function(req, res, next) {
  User.find(function(err, users){
    if(err){ return next(err); }

    res.json(users);
  });
});*/

// Get user data
router.get('/:email', function(req, res, next) {
	
	var email = req.params.email;
	
    User.findOne({email: email}).exec(function (err, user){
        if (err) {
			return next(err);
		}
        if (!user) {
			return next(new Error('User not found'));
		}
		
		// Of course, we don't want to send out sensitive information though, only some fields

        req.user = {};
		req.user._id = user._id;
		req.user.email = user.email;
		req.user.firstname = user.firstname;
		req.user.lastname = user.lastname;
		req.user.origincountry = user.origincountry;
		req.user.origincity = user.origincity;
		req.user.destinationcountry = user.destinationcountry;
		req.user.destinationcity = user.destinationcity;
		req.user.age = user.age;
		req.user.gender = user.gender;
		
		if(user.picture != '')
		{
			if(user.picture.substring(0, 4) != 'http') // Facebook has 'http', so if we don't have it, then it's our image
				req.user.picture = 'pictures/'+user.picture;
			else
				req.user.picture = user.picture;
		}
		else
			req.user.picture = 'img/avatar-placeholder.png';
		
		res.json(req.user);
    });
});

// Does not require authentication as one would need to know the ID (which is rather complex) AND AngularJS would need 'auth' in the routes part...which I don't know how to implement at the time of writing this
router.get('/profile/:id', function(req, res, next) {
	
	var id = req.params.id;
	
    User.findOne({_id: id}).exec(function (err, user){
        if (err) {
			return next(err);
		}
        if (!user) {
			return next(new Error('User not found'));
		}
		
		// Of course, we don't want to send out sensitive information though, only some fields

        req.user = {};
		req.user.firstname = user.firstname;
		req.user.lastname = user.lastname;
		req.user.origincountry = user.origincountry;
		req.user.origincity = user.origincity;
		req.user.destinationcountry = user.destinationcountry;
		req.user.destinationcity = user.destinationcity;
		req.user.age = user.age;
		req.user.gender = user.gender;

		if(user.picture != '')
		{
			if(user.picture.substring(0, 4) != 'http') // Facebook has 'http', so if we don't have it, then it's our image
				req.user.picture = 'pictures/'+user.picture;
			else
				req.user.picture = user.picture;
		}
		else
			req.user.picture = 'img/avatar-placeholder.png';
		
		res.json(req.user);
    });
});

// Get users by destination country and city
router.get('/destinationcity/:country/:city', auth, function(req, res, next) {
	
	var city = req.params.city;
	var country = req.params.country;
	
	var search_clauses = { destinationcountry: country, destinationcity: city, email: {'$ne': req.payload.email } };
	
	if(req.params.notin !== undefined && req.params.notin.length > 0)
	{
		var notin_ids = req.params.notin;
		
		search_clauses._id = { "$nin": notin_ids }; // exclude users
	}
	
    User.find(search_clauses, '-hash -salt -email -interests -__v -fb -google').sort({'firstname': -1}).limit(5).exec(function (err, docs){
        if (err) {
			return next(err);
		}
		
        if (!docs || typeof docs === 'undefined' || docs.length == 0) {
			return next(new Error('No results found.'));
		}
		
		res.json(docs);
    });
});

router.post('/update', auth, function(req, res, next) {
	
	if(	!req.body.firstname || !req.body.lastname
		|| !req.body.origincountry || !req.body.origincity
		|| !req.body.destinationcountry|| !req.body.destinationcity || !req.body.gender)
	{
		return res.status(400).json('Please fill out all fields');
	}
	
	var email = req.payload.email;
	
    User.findOne({email: email}).exec(function (err, user){
        if (err) {
			/*res.status(401);
			res.json('User not found.');*/
			return next(new Error('User not found.'));
		}
        if (!user) {
			/*res.status(401);
			res.json('User not found.');*/
			return next(new Error('User not found.'));
		}

		user.firstname = req.body.firstname;
		user.lastname = req.body.lastname;
		user.age = req.body.age;
		user.origincountry = req.body.origincountry;
		user.origincity = req.body.origincity;
		user.destinationcountry = req.body.destinationcountry;
		user.destinationcity = req.body.destinationcity;
		user.gender = req.body.gender;
		
		user.save(function(err, post) {
			if(err)
			{
				/*res.status(400);
				res.json('Could not save your interests.');*/
				return next(new Error('Could not save your options.'));
			}

			res.json({message: 'Options updated successfully.'});
		});
    });
});

var storage = multer.diskStorage({ //multers disk storage settings
	destination: function (req, file, cb) {
		cb(null, './public/pictures')
	},
	filename: function (req, file, cb) {
		var datetimestamp = Date.now();
		req.userPicture = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
		cb(null, req.userPicture);
	}
});

var upload = multer({ //multer settings
	storage: storage
}).single('file');

router.post('/update/picture', auth, function(req, res, next) {
	
	var email = req.payload.email;
	
    User.findOne({email: email}).exec(function (err, user){
        if (err) {
			return next(new Error('User not found.'));
		}
        if (!user) {
			return next(new Error('User not found.'));
		}

		upload(req,res,function(err){
			if(err){
				return next(err);
			}
			
			user.picture = req.userPicture;
			
			user.save(function(err, post) {
				if(err)
				{
					return next(new Error('Could not save your profile picture.'));
				}

				res.json({message: 'Profile picture updated successfully.', picture: user.picture});
			});
		})
    });
});

module.exports = router;
