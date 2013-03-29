/*
 * Vicolo
 * 
 * The User controller
 * 
 */
 
// Requirements
var utils = require('../lib/utils');
var params = require('../params');
var UserModels = require('../models/base');
var crypto = require('crypto');
// Use mongodb to define the id object in this controller
var BSON = require('mongodb').BSONPure;

/*
 *  The route function
 * 	Get as parameter the application instanced in app.js
 * 
 */

function route (app) {

    // Login post route
    app.post('/login', utils.accesslog, function (req, res) {
	// Sanitize and check the form
	req.assert('email', 'params.errors.wrong').isEmail();
	req.assert('password', 'params.errors.wrong').len(4,20);
	req.assert('password', 'params.errors.wrong').isAlphanumeric();
	// No space or special character at the end or start of the line
	req.sanitize('email').trim(' ');
	req.sanitize('password').trim(' ');
	// Get errors as object (without true it give errors as array of object)
	// NOTE: ERRORS is an array of objects
	var errors = req.validationErrors();
                
	// If there are errors on validation send alert, or check for the user
	if (errors) { 
	    // For now don't parse error object, only stringify
	    // Write in log the attempt
	    utils.applog('warn', "Error for " + req.body.email + "in login attempt: " + JSON.stringify(errors));
	    res.json({method: req.url, email: req.body.email, message: errors});
	} else {
			// Create instance
			var user = new UserModels(params.basic_db, 'users');
			// Get the user with usernam
			user.find({email: req.body.email}, {}, function callback (results) {
				
				if (results[0]) {
					// Calculate the password hash
					var newhash = crypto.createHash('sha1').update(req.body.password+results[0].salt).digest('hex');

					if (results[0].password === newhash) {
						// If check is done, set session 
						req.session.user_id = results[0]._id;
						req.session.user = results[0].email;
						req.session.username = results[0].name;
						req.session.connected = true;
						// Set user role
                                                req.session.role = results[0].role;
                                                res.json({method: req.url, message: 'OK'});
                                        } else {
                                            // TODO See if add the wrong password attempt too
                                            utils.applog('warn', "Error for " + req.body.email + "in login attempt: wrong password");
                                            // Wrote a message that the callback return. Limit user information about the error, for security reasons
                                            res.json({method: req.url, message: [{error: 'NOTFOUND', msg: 'errors.notFound'}]});
					}
				} else {
					// Wrote a message that the callback return. Limit user information about the error, for security reasons
					res.render({method: 'login', message: [{error: 'NOTFOUND', msg: 'errors.notFound'}]});
				}
			
			});
		}
	});
	
    // The logout route
    app.get('/logout', utils.accesslog, utils.restricted, function(req, res){
	req.session.destroy(function(err){
  	    if (err) {
		utils.applog('error', err);
			}
        });
	res.json({method: req.url, message: 'Logged Out'});
    });

}

exports.route = route;

