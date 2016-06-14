var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');

var auth = jwt({secret: process.env.MYSECRET, userProperty: 'payload'});

var Connection = mongoose.model('Connection');
var User = mongoose.model('User');
var Message = mongoose.model('Messages');
var ListMessages = mongoose.model('ListMessages');

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

// Get a user's current connection requests
// This will verify the Payload against the :id -> if the user is not the same it will give an error because we can't see other people's connections
router.get('/:id', auth, getUser, function(req, res, next) {
	
	var id = req.params.id;
	
	if(id != req.user._id)
		return next(new Error('User mismatch.'));

	// Get our messages (uid1=id OR uid2=id)
	Message.find({$or:[{uid1: id},{uid2: id}]}).populate('uid1', '-hash -salt -interests -__v -fb -google').populate('uid2', '-hash -salt -interests -__v -fb -google').exec(function (err, messages){
		if (err) {
			return next(err);
		}

		if (!messages || typeof messages === 'undefined' || messages.length == 0) {
			return next(new Error('No messages found.'));
		}
		console.log(messages);
		res.json(messages);
	});

});

router.get('/mine/:id/:cosa', auth, getUser, function(req, res, next) {

	var id = req.params.id;
	var id2 = req.params.cosa;

	if(id != req.user._id)
		return next(new Error('User mismatch.'));
	
	Message.find({cid: id2}).populate('uid1', '-hash -salt -interests -__v -fb -google').populate('uid2', '-hash -salt -interests -__v -fb -google').exec(function (err, messages){
		if (err) {
			return next(err);
		}

		if (!messages || typeof messages === 'undefined' || messages.length == 0) {
			return next(new Error('No messages found.'));
		}
		console.log(messages);
		res.json(messages);
	});

});

router.get('/list/:id', auth, getUser, function(req, res, next) {

	var id = req.params.id;

	if(id != req.user._id)
		return next(new Error('User mismatch.'));

	// Get our messages (uid1=id OR uid2=id)
	ListMessages.find({$or:[{uid1: id},{uid2: id}]}).populate('uid1', '-hash -salt -interests -__v -fb -google').populate('uid2', '-hash -salt -interests -__v -fb -google').exec(function (err, messages){
		if (err) {
			return next(err);
		}

		if (!messages || typeof messages === 'undefined' || messages.length == 0) {
			return next(new Error('No messages found.'));
		}
		console.log(messages);
		res.json(messages);
	});

});

router.post('/message', function(req, res, next){
	
		var message = new Message();
	console.log(req);

			message.cid = req.body.cid;
			message.uid1 = req.body.uid1;
			message.uid2 = req.body.uid2;
			message.From = req.body.From;
			message.To = req.body.To;
			message.message = req.body.message;
	
	var date = new Date();
	
	
		message.save(function (err){
			if(err){ return next(err); }

			ListMessages.findOneAndUpdate({ cid: message.cid }, { lastmessage: message.message }, function(err, data) {
				if (err) { return next(err); }
				res.json("Message sent successfully!");
			});
		});

	
	
	/*if(!message.cid){
		ListMessages.findOne().sort('-itemId').exec(function(err, item) {
			item.cid
		});
	}*/
	
});

router.post('/newmessage', function(req, res, next){

	var message = new Message();
	var listmessage = new ListMessages();

	console.log("#####EL BODYYYY######");
	console.log(req.body);
	message.cid = req.body.cid;
	message.uid1 = req.body.uid1;
	message.uid2 = req.body.uid2;
	listmessage.uid1 = req.body.uid1;
	listmessage.uid2 = req.body.uid2;
	message.From = req.body.uid1;
	message.To = req.body.uid2;
	message.message = req.body.message;
	listmessage.lastmessage = req.body.message;


	 ListMessages.findOne().sort('cid').exec(function(err, item) {
		 	console.log("############ CID");
		 	console.log(item.cid);
			message.cid = item.cid-1;
		 	listmessage.cid = item.cid-1;
		 console.log(message.cid);

		 message.save(function (err){
			 if(err){ return next(err); }

			 listmessage.save(function (err){
				 if(err){ return next(err); }

				 res.json("New Message sent successfully!");
			 });
		 });

		 
		 
	 });



});
module.exports = router;
