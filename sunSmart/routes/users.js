var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require("jwt-simple");
var Device =  require("../models/device");
var User = require("../models/users");
var bcrypt = require("bcrypt-nodejs");

// Secret key for JWT
//var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();
var secret = "super_secure_secret";


/* GET Authenticate user on sign in. */
router.post('/signin', function(req, res, next) {
    // The following error messages might have too much information ONLY for debugging.
    User.findOne( { email: req.body.email} , function(err, user) {
	if (err) {
	    res.status(401).json({ error: "Database findOne error" });
	} else if (!user) {
	    res.status(401).json({ error: "User does not exist" });
	} else {
	    bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) { 
		if (err) {
		    res.status(401).json({ error: "bcrypt error" });
		} if (valid) {
		    var token = jwt.encode({email: req.body.email}, secret);
		    res.status(201).json({ token: token , fullName: user.fullName, redirect: "/home.html"});
		} else {
		    res.status(401).json({ error: "Wrong password" });
		}
	    });
	}
    });
});

/* Register a new user */
router.post('/register', function(req, res, next) {
    // Create a hash for the submitted password
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
	// Prepare a new user
	var newUser = new User( {
	    email: req.body.email,
	    fullName: req.body.fullName,
	    passwordHash: hash // hashed password
	});
	newUser.save( function(err, user) {
	    if (err) { // this error could be a duplicate key error when the same email insertion tried
		res.json( {success: false, message: err.errmsg } );
	    } else {
		res.status(201).json( {success: true, message: user.fullName + " has been created", redirect:"/signin.html" } );
	    }
	});
    });
});

/* GET status */
router.get("/status", function(req, res) {
   // Check if the X-Auth header is set
   if (!req.headers["x-auth"]) {
	   return res.status(401).json({error: "Missing X-Auth header"});
   }
   // X-Auth should contain the token value
   var token = req.headers["x-auth"];
   // try decoding
   try {
	   var decoded = jwt.decode(token, secret);
	   var userStatus = {};
	   // Find a user based on decoded token
	   User.findOne({email:decoded.email}, function (err, user) {
	      if (err)
		   return res.json({error : err});
	         else {
		         if (!user) {
		            return res.json({error : "User not found"});
		      } else {
		         userStatus['email'] = user.email;
		         userStatus['fullName'] = user.fullName;
		         userStatus['lastAccess'] = user.lastAccess;
		         userStatus['redirect'] = '/home.html';
		    
		         // Find devices based on decoded token
		         Device.find({ userEmail : decoded.email}, function(err, devices) {
			         if (err) {
			            res.json({error : err});
			         } else {
			            // Construct device list
			            var deviceList = []; 
			            for (device of devices) {
				            deviceList.push({ 
				               deviceId: device.deviceId,
				               apikey: device.apikey,
				            });
			            }
			            userStatus['devices'] = deviceList;
			            res.json(userStatus);
			         }
		         });
		      }
	      }
	   });
   } catch (ex) {
	   res.status(401).json({ error: "Invalid JWT" });
   }
});

module.exports = router;
