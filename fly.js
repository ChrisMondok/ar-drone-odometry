var drone = new (require('ar-drone')).createClient();
var controller = new (require('droneController')).droneController(drone);

var lastNavdata = null;

drone.on('navdata',gotNavData);

lookForOrangeAndBlueStickers();


function lookForOrangeAndBlueStickers() {
	drone.config('detect:detect_type', 10);
	drone.config('detect:enemy_colors', 3);
	drone.config('detect:detections_select_h',1);
}

function gotNavData(navdata) {

	lastNavdata = navdata;

	if('demo' in navdata) {
		console.log("Battery: %s",navdata.demo.batteryPercentage);
	}

//	if('magneto' in navdata)
//		message.heading = navdata.magneto.heading.fusionUnwrapped/180*Math.PI;
}
