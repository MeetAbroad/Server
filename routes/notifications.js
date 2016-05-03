var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var auth = jwt({secret: process.env.MYSECRET, userProperty: 'payload'});

var Connection = mongoose.model('Connection');
var User = mongoose.model('User');

// Our getUser middleware
var getUser = function(req, res, next) {

	User.findOne({email: req.payload.email }, '-hash -salt -interests -__v -fb').exec(function (err, user){
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

// Get unread notifications (for now it's just pending requests... :D)
router.get('/', auth, getUser, function(req, res, next) {
	
	var id = req.user._id;
	
	// Get our received waiting to be accepted connections
    Connection.find({uid2: id, accepted: false}).populate('uid1', '-hash -salt -interests -__v -fb').exec(function (err, docs){
        if (err) {
			return next(err);
		}
		
		if (!docs || typeof docs === 'undefined' || docs.length == 0) {
			return next(new Error('No results found.'));
		}

		res.json({total: docs.length, notifications: docs});
    });
});

// Get total unread notifications
router.get('/total', auth, getUser, function(req, res, next) {
	
	var id = req.user._id;
	
	// Get our received waiting to be accepted connections
    Connection.count({uid2: id, accepted: false}).exec(function (err, c){
        if (err) {
			return next(err);
		}
		
		res.json(c);
    });
});

module.exports = router;
