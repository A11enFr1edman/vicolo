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
	req.assert('email', 'params.messages.wrong').isEmail();
	req.assert('password', 'params.messages.wrong').len(4,20);
	req.assert('password', 'params.messages.wrong').isAlphanumeric();
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
                                            res.json({method: req.url, message: params.messages.notFound});
					}
				} else {
					// Wrote a message that the callback return. Limit user information about the error, for security reasons
					res.json({method: req.url, message: params.messages.notFound});
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

	// The post for user create or update, we pass the type as url parameter and then the use body information
	app.post('/user/:operation', utils.accesslog, function (req, res) {
		// Sanitize and check the form
		req.assert('email', params.messages.wrong).isEmail();
		req.assert('password', params.messages.wrong).len(4,20);
		req.assert('password', params.messages.wrong).isAlphanumeric();
                req.assert('name', params.messages.wrongNameLength).len(4,20);
		// No space or special character at the end or start of the line
		req.sanitize('email').trim(' ');
		req.sanitize('password').trim(' ');
		// Get errors as object (without true it give errors as array of object)
		var errors = req.validationErrors();

		// If there are errors on validation send alert, or check for the user
		if (errors) { 
			// For now don't parse error object, only stringify
			// Write in log the attempt
			utils.applog('warn', "Error for " + req.body.email + "in registration attempt: " + JSON.stringify(errors));
			// NOTE: You can set header like 500 if you want return internal server error to client, for now it return
			// an error with status code 200 (OK)
			res.json({method: req.url, message: errors, data: req.body});
		} else {
                        // Create a random salt
			var salt = crypto.randomBytes(256);
			// Generate crypt password with salt
			var myhash = crypto.createHash('sha1').update(req.body.password+salt).digest('hex');
			// Create the JSON for the database
			var value = {};
                        var slug = req.body.name;
                        slug = slug.replace(/\s/g,'-').toLowerCase();
                        value.slug = slug;
                        value.name = req.body.name;
                        if (req.params.operation === "create") {
                            value.email = req.body.email;
                        }
			value.password = myhash;
                        value.salt =  salt;
                        // Set the role, default is user for registred user with simple permissions, else if admin set the role
                        // This don't allow to the user to change your role to admin or other
                        if (req.body.role && req.session.admin) {
                            value.role = req.body.role;
                        } else {
                            // Setthe defaut role number for user (1)
                            value.role = 1;
                        }
			// Instance User class
			var user = new UserModels(params.basic_db, 'users');
			if (req.params.operation === "create") {
				// Only admin can create new user
				if (req.session.user && !req.session.admin) {
					res.json({method: req.url, message: params.message.appError});
				} else {
        	                    // Instance a new class only for the find operation
	                            // Instance this because mongodb don't allow multiple connection with the same class 
                	            var user_find = new UserModels(params.basic_db, 'users');
                        	     // Check if there is other equal email in the database, mail must be unique
                            		user_find.find({email: req.body.email}, {}, function (results) {
                                	if (results[0]) {
                                            // Give application error if user is already present
                                            utils.applog('error', 'User ' + req.body.email + ' already present by ' + req.connection.remoteAddress);
	                                    res.json({method: req.url, message: params.messages.appError});
        	                        } else {
                	                    user.insert(value, function (results) { 
                                                // Do this only if admin (role = 0)
                                                if (req.session.role != 0) {
                                                    // If check is done, set session and login the user
                                                    req.session.user_id = results[0]._id; 
                                                    req.session.user = results[0].email;
                                                    req.session.username = results[0].name;  
                                                    req.session.connected = true;
                                                    req.session.role = results[0].role;
                                                }
                                                res.json({method: req.url, message: params.messages.done});
                                	    });
	                                }	
        	                     });
				}

                         } else if (req.params.operation === "edit") {
				// Only admin or owner can edit their profile
				if ((req.session.user === req.body.email) || (req.session.role == 0)) {
                                    user.update({email: req.body.email}, {$set: value}, function (results) {console.log(results);
                                        // Create an array for results, because the update get back an object and on view wait for an array
                                        var results_array = new Array(results);
                                        res.json({method: req.url, message: params.messages.editUser, data: results_array});
                                    });
                                } else {
                                    utils.applog('error', 'Edit attempt not permitted for user ' + req.body.email + " from " + req.connection.remoteAddress);
                                    res.json({method: req.url, message: params.messages.appError});

				}
			} else {
                            res.json({method: req.url, message: params.messages.notFound});
			}
		}
	});


}

exports.route = route;

