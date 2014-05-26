var drone = new (require('ar-drone')).createClient();
//var website = new (require('telemetry')).website();
var controller = new (require('droneController')).droneController(drone);
//var odometry = new(require('odometry')).odometry();

var lastNavdata = null;

drone.on('navdata',gotNavData);

lookForOrangeAndBlueStickers();

//var pngStream = drone.createPngStream();
//
//pngStream.on('data',gotImage)


function lookForOrangeAndBlueStickers() {
	drone.config('detect:detect_type', 10);
	drone.config('detect:enemy_colors', 3);
	drone.config('detect:detections_select_h',1);
}

function gotNavData(navdata) {

	lastNavdata = navdata;

//	odometry.update(navdata)
//
//	var message = {
//		north:odometry.north,
//		east:odometry.east,
//	}

	if('demo' in navdata) {
		message.battery = navdata.demo.batteryPercentage
		console.log("Battery: %s",message.battery);
	}

	if('magneto' in navdata)
		message.heading = navdata.magneto.heading.fusionUnwrapped/180*Math.PI;

//	website.broadcastData(message);
}

function gotImage(image) {
	website.broadcastImage(image);
}
