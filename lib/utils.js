/*
 * Vicolo
 * 
 * The Utils function
 * 
 */

// REQUIREMENTS
var winston = require('winston');
var nodemailer = require("nodemailer");
var handlebars = require('handlebars');
var fs = require('fs');
var drex = require('drex');

// Configure the logger category and remove console logging for these log
// You can use console logging for one of this or both, simply delete .remove(winston.transports.Console)
winston.loggers.add('accesslog', {
	file: {
		filename: './logs/access.log'
    }
}).remove(winston.transports.Console);

winston.loggers.add('applog', {
	file: {
		filename: './logs/app.log'
    }
}).remove(winston.transports.Console);

// QUICK LOG FOR APPLICATION: BASIC PATH: ./logs
function applog(level, s) {
    // Format the string
    s = s.toString().replace(/\r\n|\r/g, '\n');

    // Get winston log configuration and write 
    var applog = winston.loggers.get('applog');
    applog.log(level, s);

}

// QUICK LOG FOR REQUEST: BASIC PATH: ./logs
function accesslog(req, res, next) {
	// Create the string
    var s = "From: " + req.connection.remoteAddress + " " + req.method + " " + req.url + " on: " + req.headers.host;
	
    // If exists, get user information
    if (req.session.user) {
	s = s + " User: " + req.session.user;
    }

    // Get winston log configuration and write 
    var accesslog = winston.loggers.get('accesslog');
    accesslog.info(s);

    // Function done, call next function in route
    next();
}

function restricted (req, res, next) {
    if (req.session.connected) {
        next();
    } else {
	res.json({method: req.url, message: 'Not Authorized'});
    }
}

// Check if user is already auth and redirect to index
function already_auth (req, res, next) {
    if (req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
}


exports.applog = applog;
exports.accesslog = accesslog;
exports.restricted = restricted;
exports.already_auth = already_auth;

