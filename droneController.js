//Control the ar drone with an xbox 360 controller


var arDrone = require('ar-drone');

function droneController() {
	this.js = new(require('joystick'))(0,3500,350);

	this.js.on('button', this.buttonPressed.bind(this));
	this.js.on('axis', this.axisMoved.bind(this));

	this.drone = new (arDrone).createClient();

	this.drone.config('general:navdata_demo', 'FALSE');

	this.drone.on('navdata',this.gotNavData.bind(this));

	this.odometry = new(require('odometry')).odometry();

	var control = arDrone.createUdpControl();
	setInterval(function() { control.flush(); }, 30);

	this.log = false;
	this.loggedEvents = [];
}

droneController.prototype.buttonPressed = function(event) {
	if(event.value)
		switch(event.number) {
			case 0:
				console.log("Stop");
				this.drone.stop();
				break;
			case 6:
				console.log("Land");
				this.drone.land();
				break;
			case 7:
				console.log("Take off");
				this.drone.takeoff();
				break;
			case 8:
				this.toggleLogging();
				break;
			case 4:
				this.drone.disableEmergency();
				break;
			default:
				console.log(event.number,"not bound.");
		}
}

droneController.prototype.axisMoved = function(event) {
	switch(event.number) {
		case 0:
			if(event.value < 0)
				this.drone.left(-event.value/32767);
			else
				this.drone.right(event.value/32767);
			break;

		case 1:
			if(event.value > 0)
				this.drone.back(event.value/32767);
			else
				this.drone.front(-event.value/32767);
			break;

		case 3:
			if(event.value < 0)
				this.drone.counterClockwise(-event.value/32767);
			else
				this.drone.clockwise(event.value/32767);
			break;
		case 5:
			var value = (event.value+32767)/65535;
			this.drone.up(value);
			break;
		case 2:
			var value = (event.value+32767)/65535;
			this.drone.down(value);
			break;
	}
}

droneController.prototype.gotNavData = function(navdata) {
	if(this.log)
		this.loggedEvents.push(navdata);

	if('demo' in navdata)
		console.log("Battery",navdata.demo.batteryPercentage);

	this.odometry.update(navdata)
}

droneController.prototype.toggleLogging = function() {
	this.log = !this.log;
	console.log(this.log?"Enable":"Disable","logging");
	if(!this.log) {
		require('fs').writeFile('navdata',JSON.stringify(this.loggedEvents));
		this.loggedEvents = [];
	}
}

exports.droneController = droneController;
