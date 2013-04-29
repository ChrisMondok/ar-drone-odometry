var ws = require('ws');
var http = require('http');
var nodeStatic = require('node-static');

function website() {

	this.clients = [];

	this.staticContent = new nodeStatic.Server('./website');

	this.httpServer = http.createServer(function(request,response) {
		this.staticContent.serve(request,response);
	}.bind(this)).listen(8080);

	this.wsServer = new ws.Server({server:this.httpServer});
	this.wsServer.on('connection', function(ws) {

		console.log('got a client');
		this.clients.push(ws);

		ws.on('close', function() {
			this.clients.splice(this.clients.indexOf(ws),1);
		}.bind(this));

	}.bind(this));

};

website.prototype.broadcastData = function(data) {
	for(var i = 0; i < this.clients.length; i++)
		this.clients[i].send(JSON.stringify(data));
}

website.prototype.broadcastImage = function(image) {
	for(var i = 0; i < this.clients.length; i++)
		this.clients[i].send(JSON.stringify({
			image:{
				type:'png',
				src:image.toString('base64')
			}
		}));
}

website.prototype.broadcastNavData = function() {

	var odometry = new (require('odometry.js')).odometry();
	console.log("loading");
	var navdata = JSON.parse(require('fs').readFileSync('navdata-2.log'));

	for(var i = 0; i < navdata.length; i++)
	{
		odometry.update(navdata[i]);
		this.broadcast({
			east:odometry.east,
			north:odometry.north,
			heading:('magneto' in navdata?navdata.magneto.heading.fusionUnwrapped * Math.PI/180:0)
		});
	}
}

exports.website = website;
