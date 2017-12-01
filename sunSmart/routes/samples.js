var express = require('express');
var router = express.Router();
var Sample = require("../models/sample");
var Device = require("../models/device");
var jwt = require("jwt-simple");
var User = require("../models/users");
var bcrypt = require("bcrypt-nodejs");

var secret = "super_secure_secret";

// POST publishes sample data given the device ID
router.post('/publish', function(req, res, next) {

    var responseJson = {
        published: false,
        message : "",
    };

    // Ensure the request includes deviceId, longitude, latitude, and uv parameters 
    if( !req.body.hasOwnProperty("deviceId") || !req.body.hasOwnProperty("longitude") ||
	!req.body.hasOwnProperty("latitude")|| !req.body.hasOwnProperty("uv")) {

	responseJson.message = "Missing request parameters";

	res.status(400).send(JSON.stringify(responseJson));
        return;
    }

    // See if device is already registered
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device === null) {
            responseJson.message = "Device ID " + req.body.deviceId + " is not registered.";
            res.status(400).send(JSON.stringify(responseJson));
        }
        else {
		//Create a new sample with specified id, longitude, latitude, uv
		if( !req.body.hasOwnProperty("zip")) {
			var newSample = new Sample({
				deviceId: req.body.deviceId,
				longitude: req.body.longitude,
				latitude: req.body.latitude,
				uv: req.body.uv
			});
		//Create a new sample with optionally supplied zip parameter
		}
		else {
			 var newSample = new Sample({
                                deviceId: req.body.deviceId,
                                longitude: req.body.longitude,
                                latitude: req.body.latitude,
                                uv: req.body.uv,
				zip: req.body.zip
                        });
		}

            	// Save device. If successful, return success. If not, return error message.
            	newSample.save(function(err, newSample) {
                	if (err) {
                    		console.log("Error: " + err);
                    		responseJson.message = err;
                    		res.status(400).send(JSON.stringify(responseJson));
                	}
                	else {
                    		responseJson.published = true;
                    		responseJson.message = "Sample was succesfully published by Device with id " + req.body.deviceId + ".";
                    		res.status(201).send(JSON.stringify(responseJson));
                	}
            	});
        }
    });
});

// GET request returns last sample published by device specified.
router.get('/last/:devid', function(req, res, next) {
    	var deviceId = req.params.devid;
    	// Create query based on parameters deviceId
	var query = { "deviceId": deviceId };

	getSamples(deviceId, false, res);

});

// GET request returns all samples published by device specified.
router.get('/all/:devid', function(req, res, next) {
        var deviceId = req.params.devid;

        // Create query based on parameters deviceId
        var query = { "deviceId": deviceId };

        getSamples(deviceId, true, res);

});

// GET request returns all samples published by device specified.
router.get("/recent/:selected", function(req, res) {
	var selected = req.params.selected;
	// Check if the X-Auth header is set
	if (!req.headers["x-auth"]) {
	   return res.status(401).json({error: "Missing X-Auth header"});
	}
	// X-Auth should contain the token value
	var token = req.headers["x-auth"];
	
	try{
		var deviceId = req.params.devid;
		
		var decoded = jwt.decode(token, secret);
		
		// Create query based on token userEmail
		var query = {"userEmail": decoded.email};
		var devices = new Array();
		// Query the devices collection to returned requested documents
		Device.find(query, function(err, allDevices) {
				if (err) {
							var errormsg = {"message": err};
							res.status(400).send(JSON.stringify(errormsg));
				}else{
					for (var doc of allDevices) {
						//if(!devices.includes(doc.deviceId))
							devices.push(doc.deviceId);
					}
				}
			
			// Create JSON response consisting of an array of Samples
			var responseJson = {};
			
			var recent = 10;
			var samples = [];
			// Query the samples collection to returned requested documents
			//console.log("devices found: " + devices.length );
			
			var query = { "deviceId": devices[selected] };
			
			Sample.find(query, function(err, allSamples) {
					if (err) {
						var errormsg = {"message": err};
						res.status(400).send(JSON.stringify(errormsg));
					}
					else {
						//console.log("query size: " + allSamples.length);	
						if(allSamples.length >= recent){	
							for (var i = allSamples.length - recent; i >= 0 && i < allSamples.length; i++) {
								// For each found sample add a new element to the array
								// with the device id and sample data
								samples.push({ "deviceId": allSamples[i].deviceId, "longitude": allSamples[i].longitude,
								"latitude": allSamples[i].latitude, "uv": allSamples[i].uv,
								"zip": allSamples[i].zip, "submitTime": allSamples[i].submitTime});
							}
						}else{
							for (var doc of allSamples) {
								// For each found sample add a new element to the array
								// with the device id and sample data
								samples.push({ "deviceId": doc.deviceId, "longitude": doc.longitude,
								"latitude": doc.latitude, "uv": doc.uv,
								"zip": doc.zip, "submitTime": doc.submitTime});
							}
						}
					}
				//console.log("sample size: " + samples.length);
				responseJson['samples'] = samples;
				res.json(responseJson);
			});
		});
	} catch (ex) {
		console.log(ex);
	   res.status(401).json({ error: "Invalid JWT" });
	}

});

// Query the sampless collection to returned requested documents
function getSamples(deviceId, all, res){
	
	// Create query based on parameters deviceId
        var query = { "deviceId": deviceId };

	    res.setHeader('Access-Control-Allow-Origin', '*');

        Sample.find(query, function(err, allSamples) {
                if (err) {
                        var errormsg = {"message": err};
                        res.status(400).send(JSON.stringify(errormsg));
                }
                else {
					// Create JSON response consisting of an array of Samples
					var responseJson = { samples: [] };
					for (var doc of allSamples) {
							// For each found sample add a new element to the array
							// with the device id and sample data
							responseJson.samples.push({ "deviceId": doc.deviceId, "longitude": doc.longitude,
							"latitude": doc.latitude, "uv": doc.uv,
							"zip": doc.zip, "submitTime": doc.submitTime});
					}
					if(all){
						res.status(200).send(JSON.stringify(responseJson));
					}
					else {
						var lastIndex = responseJson.samples.length - 1;
						res.status(200).send(JSON.stringify(responseJson.samples[lastIndex]));
					}
                }
        });
}

module.exports = router;
