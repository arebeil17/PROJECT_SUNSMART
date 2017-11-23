var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Process POST endpoint /debug
router.post('/devices', function(req, res, next) {

    var response = {
        msg: "Message received"
    };
    // enumerate request’s body and print out key and value
    for( var key in req.body) {
        console.log( key + ":" + req.body[key] );
    }
    // send JSON response
    res.status(201).send(JSON.stringify(response));
});

module.exports = router;
