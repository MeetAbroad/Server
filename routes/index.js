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
	|| !req.body.agree) {
    return res.status(400).json({message: 'Please fill out all fields'});
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

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
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
	},
	function(req, res,done) {
		
		console.log(done);
		console.log(req);
		console.log(res);
		
		User.findOne({ 'facebook.id': req.facebook.id }, function (err, doc){
			
			//console.log("Generating token");
			doc.token = doc.generateJWT();
			doc.save(function(err) {
				if (err) {
					//console.log('Error in Saving token for old user: '+err); 
					return res.status(401).json(info); 
				}
				else
				{
					console.log("Token:",doc.generateJWT());
					  
					//res.json({token: doc.generateJWT()});
					res.redirect('/login/facebook/token?token=' + doc.generateJWT());                                        
				}
			});
		});
});

router.get('/login/facebook/token', function(req, res, next){
	res.sendFile(__dirname + '/client_views/auth/facebook.html');
});

module.exports = router;
