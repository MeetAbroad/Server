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

router.post('/new', auth, function(req, res, next) {
  var interest = new Interest(req.body);

  interest.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

module.exports = router;
