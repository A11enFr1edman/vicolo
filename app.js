/*
 * Vicolo
 * 
 * Starting application with clustering for multicore CPUs
 * 
 */
	
// REQUIREMENTS
var fs = require('fs');
var cluster = require('cluster');
var Config = require('./config');
var express = require('express');
var app = express();
var utils = require('./lib/utils');
var parameters = require('./params');
var dns = require('native-dns');
var util = require('util');
var DnsModels = require('./models/base');

// Instance the configuration class
var configuration = new Config();

// See CPU number for clustering
var numCPUs = require('os').cpus().length;

// If app.js goes down, app works thanks to workers
// if all workers go down and app.js is up, the app doesn't work
if (cluster.isMaster) {

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker) {
        utils.applog('warn', 'Worker ' + worker.pid + ' died. Restart...');
        // refork the process if one death
        cluster.fork();
    });

} else {
	
    // Instance the application
    configuration.Application(app);

    // get all controller as a module (all function is route)
    fs.readdir(__dirname + '/controller', function (err, files) {
        files.forEach(function(item) {
            require('./controller/'+item).route(app);
        });
    });

    // Define server variable
    var server;
	
    // If https params is set start with https
    if (parameters.https_options) {
        // require https library
	var https = require('https');
		
	// Get the credentials and create HTTPS server
	var pk = fs.readFileSync(parameters.https_options.private_key).toString();
	var pc = fs.readFileSync(parameters.https_options.certificate).toString();
	var server = https.createServer({key: pk, cert: pc}, app);
	
	// Start listening
	server.listen(parameters.client_port, parameters.client_host);

    } else {
	var server = require('http').createServer(app)
	// Else start listening in http
	server.listen(parameters.client_port, parameters.client_host);

    }

    // Start and define DNS server
    var dnsServer = dns.createServer();

    dnsServer.on('request', function (request, response) {
	// Get the domain name and the type
	var domain = request.question[0].name;
	var type = request.question[0].type;
	// Instance mongodb class
	var dnsmodel = new DnsModels(parameters.basic_db, 'zones');
	// Find record in mongodb
	dnsmodel.find({domain: domain, type: type}, {}, function (results) {
	    if (results[0]) {
		var entries = results[0].value;
		// TODO: DO IT ASYNC ?
		// Get all the records 
		for(var i=0;i<entries.length;i++){
		    var entry = entries[i];
   		    // Send response, mapping the right dns record function
		    response.answer.push(dns[parameters.record_mapping[type]](entry));
		}
		response.send();
	    } else {
		// Send empty response => Record not found
		response.send();
            }
	}); 
    });

    dnsServer.on('error', function (err, buff, req, res) {
  	utils.applog('error', err.stack);
    });

    utils.applog('info', 'DNS listening on ' + parameters.dns_port);
    dnsServer.serve(parameters.dns_port);

}
