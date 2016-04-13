var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var auth = jwt({secret: process.env.MYSECRET, userProperty: 'payload'});

var Connection = mongoose.model('Connection');
var User = mongoose.model('User');

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

// Get a user's current connections
router.get('/:id', auth, getUser, function(req, res, next) {
	
	var id = req.params.id;
	
	if(id != req.user._id)
		return next(new Error('User mismatch.'));
	
	console.log("id: "+id);
	
	// Get our current connections (uid1=id OR uid2=id)
    Connection.find({$or:[{uid1: id},{uid2: id}]}).exec(function (err, connections){
        if (err) {
			return next(err);
		}
		
        if (!connections || typeof connections === 'undefined' || connections.length == 0) {
			return next(new Error('No connections found.'));
		}
		
		res.json(connections);
    });
});

// Create connection
router.post('/new/:id', auth, getUser, function(req, res, next) {
	
	var id = req.params.id;
	
    User.findOne({_id: id}).exec(function (err, user){
        if (err) {
			return next(err);
		}
        if (!user) {
			return next(new Error('User not found'));
		}

		// We found the user, so now we must find a connection between the two
		Connection.findOne( {$or:[{uid1: req.user._id, uid2: user._id},{uid1: user._id, uid2: req.user._id}]} ).exec(function (err, connection){
			if (err) {
				return next(err);
			}
			
			// We handle errors differently here, because we use jQuery for this route
			if (connection && connection.accepted == false) {
				//res.json({'error': 'A pending connection already exists with this user.'});
				
				return next(new Error('A pending connection already exists with this user.'));
			}
			else if (connection && connection.accepted == true) {
				//res.json({'error': 'A connection already exists with this user.'});
				
				return next(new Error('A connection already exists with this user.'));
			}
			else
			{
				var c = new Connection();
				c.uid1 = req.user._id; // Ours
				c.uid2 = user._id; // Theirs

				c.save(function(err, post){
					if(err){ return next(err); }

					res.json("Request sent successfully!");
				});
			}
		});
    });
});

// Accept connection
router.post('/accept/:id', auth, getUser, function(req, res, next) {
	
	var id = req.params.id;
	
    Connection.findOne({_id: id, uid2: req.user._id, accepted: false}).exec(function (err, connection){
        if (err) {
			return next(err);
		}
        if (!connection) {
			return next(new Error('Request not found.'));
		}
		
		connection.accepted = true;

		connection.save(function(err, post){
			if(err){ return next(err); }

			res.json("Request accepted!");
		});
    });
});

// Reject connection
router.post('/reject/:id', auth, getUser, function(req, res, next) {
	
	var id = req.params.id;
	
    Connection.findOne({_id: id, uid2: req.user._id, accepted: false}).exec(function (err, connection){
        if (err) {
			return next(err);
		}
        if (!connection) {
			return next(new Error('Request not found.'));
		}
		
		connection.accepted = true;

		connection.remove(function(err, post){
			if(err){ return next(err); }

			res.json("Request rejected!");
		});
    });
});

module.exports = router;
