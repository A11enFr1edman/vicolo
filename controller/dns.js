/*
 * Vicolo
 * 
 * The Dns controller
 * 
 */
 
// Requirements
var utils = require('../lib/utils');
var params = require('../params');
var Model = require('../models/base');

/*
 *  The route function
 * 	Get as parameter the application instanced in app.js
 * 
 */
 
function route (app) { 
  	
    // Set index route
    app.get('/', utils.accesslog, utils.restricted, function(req, res){
        res.json({method: req.url}); 
    });    

    // Insert record
    // POST FORM FIELD: domain, type, name, address, ttl, data,  .... 
    // (TODO: DIFFERENCE FOR EACH TYPE) 
    app.post('/dns/record/new', utils.accesslog, utils.restricted, function(req, res) {
        // Sanitize and check the form
        req.assert('domain', params.messages.empty).notEmpty();
        req.assert('type', params.messages.wrong).isNumeric();
        req.assert('name', params.messages.wrong).isAlphanumeric();
        // No space or special character at the end or start of the line
        req.sanitize('domain').trim(' ');
        req.sanitize('type').toInt(); // Sanitize to int for database storing
        req.sanitize('name').trim(' ');
        
        // Check and sanitize for each type
        if (req.body.type == 1) {
            req.assert('address', params.messages.empty).notEmpty();
        }
        if (req.body.type == 15) {
            req.assert('exchange', params.messages.empty).notEmpty();
            req.assert('priority', params.messages.wrong).isNumeric();
            req.sanitize('priority').toInt(); // Sanitize to int for database storing
        }
        if (req.body.type == 16) {
            req.assert('data', params.messages.empty).notEmpty();
        }
        // Get errors as object (without true it give errors as array of object)
        // NOTE: ERRORS is an array of objects
        var errors = req.validationErrors();

        // If there are errors on validation send alert, or check for the user
        if (errors) {
	    // For now don't parse error object, only stringify
	    // Write in log the attempt
	    utils.applog('warn', "Error for " + req.body.email + "in login attempt: " + JSON.stringify(errors));
	    res.json({method: req.url, message: errors});
	} else {
            // Check if type is allowed
            if (params.record_mapping[req.body.type]) {
                // Create the record 
                var record = {
                    domain: req.body.domain,
                    type: req.body.type,
                    value: [{
                        name: req.body.name,
                        ttl: req.body.ttl
                     }]
                };
                // Each record type have his personal fields
                if (req.body.type == 1) {
                    record.value[0].address = req.body.address;
                }
                if (req.body.type == 15) {
                    record.value[0].priority = req.body.priority;
                    record.value[0].exchange = req.body.exchange;
                } 
                if (req.body.type == 16) {
                    record.value[0].data = req.body.data;
                } 
                // Instance the database class
                var dnsClass = new Model(params.basic_db, 'zones');
                // store in mongodb
                dnsClass.insert(record, function (results) {
                    if (results[0]) {
                        res.json({method: req.url, message: params.messages.done});
                    } else {
                        res.json({method: req.url, message: params.messages.fail});                    
                    }
                });
            } else {
                res.json({method: req.url, message: params.messages.notAllowed});
            }
	}
    });
}

exports.route = route;
