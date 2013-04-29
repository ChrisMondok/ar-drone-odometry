var drone = new (require('ar-drone')).createClient();
var website = new (require('telemetry')).website();
var controller = new (require('droneController')).droneController(drone);
var odometry = new(require('odometry')).odometry();

drone.on('navdata',gotNavData);

var pngStream = drone.createPngStream();

pngStream.on('data',gotImage)

function gotNavData(navdata) {

	odometry.update(navdata)

	var message = {
		north:odometry.north,
		east:odometry.east,
	}

	if('demo' in navdata)
		message.battery = navdata.demo.batteryPercentage

	if('magneto' in navdata)
		message.heading = navdata.magneto.heading.fusionUnwrapped/180*Math.PI;

	website.broadcastData(message);
}

function gotImage(image) {
	website.broadcastImage(image);
}
