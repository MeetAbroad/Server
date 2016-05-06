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

// Get users by origincity
router.get('/basic', auth, function(req, res, next) {
	
	var search_clauses = {};
	if (req.params.firstname !== undefined && req.params.firstname !== null)
		search_clauses.firstname = req.params.firstname;
	
	if (req.params.lastname !== undefined && req.params.lastname !== null)
		search_clauses.lastname = req.params.lastname;
	
    User.find(search_clauses, '-hash -salt -email -interests -__v -fb').populate('interests').exec(function (err, docs){
        if (err) {
			return next(err);
		}
		
        if (!docs || typeof docs === 'undefined' || docs.length == 0) {
			return next(new Error('No results found.'));
		}
		
		var users = [];
		
		// Time to go through each user
		docs.each(function(error, doc){
			if (error) return new(error);
			if (!doc) return next(new Error('No user found.'));
			
			// Now it's time to check the interests
			// TODO
			users.push(doc);
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
router.get('/advanced', auth, function(req, res, next) {
	

});

module.exports = router;
