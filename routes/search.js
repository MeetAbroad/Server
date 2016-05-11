var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var User = mongoose.model('User');
var auth = jwt({secret: process.env.MYSECRET, userProperty: 'payload'});

// Our getUser middleware
var getUser = function(req, res, next) {

	User.findOne({email: req.payload.email }, '-hash -salt -interests -__v').exec(function (err, user){
        if (err) {
			return next(err);
		}
		
        if (!user ) {
			return next(new Error('Logged in user not found.'));
		}
		
		req.user = user;
		
		return next();
    });
}

// Get users by origincity
router.post('/basic', auth, getUser, function(req, res, next) {
	
	var search_clauses = {destinationcity: req.user.destinationcity, destinationcountry: req.user.destinationcountry};

	if (req.body.firstname !== undefined && req.body.firstname !== null && req.body.firstname !== "")
		search_clauses.firstname = req.body.firstname;
	
	if (req.body.lastname !== undefined && req.body.lastname !== null && req.body.lastname !== "")
		search_clauses.lastname = req.body.lastname;
	
	console.log(search_clauses);
	
    User.find(search_clauses, '-hash -salt -email -__v -fb -google').sort({'name': -1}).limit(10).populate('interests').exec(function (err, docs){
        if (err) {
			return next(err);
		}
		
        if (!docs || typeof docs === 'undefined' || docs.length == 0) {
			return next(new Error('No results found.'));
		}
		
		var users = [];

		// Time to go through each user
		docs.forEach(function(doc){
			
			// Now it's time to check the interests
			if(req.body.selected !== undefined && req.body.selected.length != 0 && req.body.selected !== null)
			{
				var added = false;
				doc.interests.forEach(function(interest){
					if(!added)
					{
						// If this interest is in our interests selection...
						if(req.body.selected[interest.codename] !== undefined && req.body.selected[interest.codename] !== null && req.body.selected[interest.codename] === true)
						{
							users.push(doc);
							added = true;
						}
					}
				});
			}
		});
		
		res.json(users);
    });
});

/* Accept
	- Origin country and city
	- Destination country and city
	- Min and Max age
	- (future) Gender
*/
router.post('/advanced', auth, function(req, res, next) {
	

});

module.exports = router;
