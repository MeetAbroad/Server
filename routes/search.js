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

function isEmpty(obj) { 
   for (var x in obj) { return false; }
   return true;
}

// Get users by origincity
router.post('/basic', auth, getUser, function(req, res, next) {
	
	var search_clauses = {destinationcity: req.user.destinationcity, destinationcountry: req.user.destinationcountry};

	if (req.body.firstname !== undefined && req.body.firstname !== null && req.body.firstname !== "")
		search_clauses.firstname = req.body.firstname;
	
	if (req.body.lastname !== undefined && req.body.lastname !== null && req.body.lastname !== "")
		search_clauses.lastname = req.body.lastname;
	
	search_clauses._id = { $ne: req.user._id };
	
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
			else if (search_clauses.firstname !== undefined || search_clauses.lastname !== undefined) // The user searched for a first and/or last name
			{
				// No matching against interests, just add the user to the results
				users.push(doc);
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
	
	var search_clauses = {};

	if (req.body.origincountry !== undefined && req.body.origincountry !== null && req.body.origincountry !== "")
		search_clauses.origincountry = req.body.origincountry;
	
	if (req.body.origincity !== undefined && req.body.origincity !== null && req.body.origincity !== "")
		search_clauses.origincity = req.body.origincity;
	
	if (req.body.destinationcountry !== undefined && req.body.destinationcountry !== null && req.body.destinationcountry !== "")
		search_clauses.destinationcountry = req.body.destinationcountry;
	
	if (req.body.destinationcity !== undefined && req.body.destinationcity !== null && req.body.destinationcity !== "")
		search_clauses.destinationcity = req.body.destinationcity;
	
	if (req.body.firstname !== undefined && req.body.firstname !== null && req.body.firstname !== "")
		search_clauses.firstname = req.body.firstname;
	
	if (req.body.lastname !== undefined && req.body.lastname !== null && req.body.lastname !== "")
		search_clauses.lastname = req.body.lastname;
	
	// Only 'min' age set
	if (req.body.minage !== undefined && req.body.minage !== null && req.body.minage !== ""
		&& (req.body.maxage === undefined || req.body.maxage === null || req.body.maxage === ""))
		search_clauses.age = { $gt: req.body.minage };
	
	// Only 'min' age set
	if (req.body.maxage !== undefined && req.body.maxage !== null && req.body.maxage !== ""
		&& (req.body.minage === undefined || req.body.minage === null || req.body.minage === ""))
		search_clauses.age = { $lt: req.body.maxage };
	
	// Both min and max age set
	if (req.body.minage !== undefined && req.body.minage !== null && req.body.minage !== ""
		&& req.body.maxage !== undefined && req.body.maxage !== null && req.body.maxage !== "")
		search_clauses.age =  { $gt: req.body.minage, $lt: req.body.maxage };
		
	console.log(search_clauses);
	
	if(isEmpty(search_clauses) && (req.body.selected === undefined || req.body.selected === null || req.body.selected.length === 0))
		return res.status(400).json('You did not specify any criteria.');
	
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
			else
			{
				// No matching against 'Interests', just add the user to the results
				users.push(doc);
			}
		});
		
		res.json(users);
    });

});

module.exports = router;
