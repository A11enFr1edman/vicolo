/*
 * Vicolo
 * 
 * The configuration file, this class instance the Express settings 
 * and other application settings
 *
 * 
 */

// REQUIREMENTS
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var expressValidator = require('express-validator');
var utils = require('./lib/utils');
// Require parameters class and instance it
var parameters = require('./params');

// Define configuration class
var Config = function () {};

// EXPORT EXPRESS CONFIGURATION SETTINGS
Config.prototype.Application = function(app) {
    // Remove Express information from the response header
    app.use(function (req, res, next) {
	res.removeHeader("X-Powered-By");
        next();
    }); 

    // Set cookie
    app.use(express.cookieParser(parameters.cookie_secret));

    app.use(express.session({
        cookie: {maxAge: 24 * 60 * 60 * 1000},
        // SET THE DB PARAMS TO SHARE SESSION ON SAME DATABASE
        store: new MongoStore({
	    db: parameters.basic_db,
            host: parameters.mongodb_host,
            port: parameters.mongodb_port
        })
        })
    );
   
    app.use(express.compress());
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    
    app.use(expressValidator);
        
    app.use(app.router);
    
    // Set error view if env is development
    if ('development' == process.env.NODE_ENV) {
	app.use(express.errorHandler());
    }
    // Set the error page if resource isn't found
    app.use(function(req, res){
	utils.applog('error', "Application page not found " + req.url);
	res.json({method: req.url, message: '40x - Not Found'});
    });
    // Set page for application errors
    app.use(function(err, req, res, next){
	// if an error occurs Connect will pass it down
	// through these "error-handling" middleware
	// allowing you to respond however you like
	utils.applog('error', "Application error: " + err);
	res.json({method: req.url, message: '50x - Application Error'});
    });

};

module.exports = Config;

