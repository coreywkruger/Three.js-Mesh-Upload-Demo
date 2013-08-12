#!/usr/bin/env node
//var server = require('websocket-server').createServer();
//var m = require('matrix.node');
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

var server = http.createServer(function(request, response) {

    var url = '.' + (request.url == '/' ? '/index.html' : request.url);
 	if (request.url === '/favicon.ico') {
	    response.writeHead(200, {'Content-Type': 'image/x-icon'} );
	    response.end();
	    console.log('favicon requested- and promptly stifled.');
	    return;
	  }
  
    fs.readFile(url, function (err, data) {
        if (err) {
            console.log(err);
            response.writeHead(500);
            return response.end('Error loading index.html');
        }

        var tmp     = url.lastIndexOf(".");
        var ext     = url.substring((tmp + 1));
        var mime    = mimes[ext] || 'text/plain';

        response.writeHead(200, { 'Content-Type': mime });
        response.end(data, 'utf-8');

    });
    console.log((new Date()) + ' Received request for ' + request.url);
	//response.writeHead(404);
	//response.end();
});

// server.listen(8080, function() {
	// console.log((new Date()) + ' Server is listening on port 8080');
// });

server.listen(8080, '127.0.0.1', function() {
	console.log((new Date()) + ' Server is listening on port 8080');
});

var mimes = {
    'css':  'text/css',
    'js':   'text/javascript',
    'htm':  'text/html',
    'html': 'text/html',
    'ico':  'image/vnd.microsoft.icon'
};


wsServer = new WebSocketServer({
	httpServer: server,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.  You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
	  // Make sure we only accept requests from an allowed origin
	  request.reject();
	  console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
	  return;
	}

	var connection = request.accept(null, request.origin);
	console.log((new Date()) + ' Connection accepted.');
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log('Received Message: ' + message.utf8Data);
			var obj = JSON.parse(message.utf8Data);
			//console.log(obj);
			//targetPosition = (parseFloat(obj.angle) + Math.PI*2) % (Math.PI*2);
		}else if (message.type === 'binary') {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
		}
	});
	connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});