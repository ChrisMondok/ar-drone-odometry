//Control the ar drone with an xbox 360 controller

var arDrone = require('ar-drone');

function droneController(drone) {
	this.js = new(require('joystick'))(0,3500,350);

	this.js.on('button', this.buttonPressed.bind(this));
	this.js.on('axis', this.axisMoved.bind(this));

	this.drone = drone ||  new (arDrone).createClient();

	this.drone.config('general:navdata_demo', 'FALSE');

	this.drone.on('navdata',this.gotNavData.bind(this));

	var control = arDrone.createUdpControl();
	setInterval(function() { control.flush(); }, 30);

	this.cardinal = false;
	this.log = false;
	this.loggedEvents = [];

	this.latestNavData = null;

	this.joyX = 0;
	this.joyY = 0;
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
			case 9:
				this.cardinal = !this.cardinal;
				console.log("Using",this.cardinal?"cardinal":"relative","coordinate system.");
				break;
			default:
				console.log(event.number,"not bound.");
		}
}

droneController.prototype.axisMoved = function(event) {
	if(this.cardinal && this.latestNavData && 'magneto' in this.latestNavData)
	{
		var heading = -this.latestNavData.magneto.heading.fusionUnwrapped/180*Math.PI;

		if(event.number < 2)
			if(event.number)
				this.joyY = event.value/32768;
			else
				this.joyX = event.value/32768;

		var right = this.joyX * Math.cos(heading) - this.joyY * Math.sin(heading);
		var front = -(this.joyX * Math.sin(heading) + this.joyY * Math.cos(heading));
		
		this.drone.right(right);
		this.drone.front(front);
	}
	else
	{
		switch(event.number) {
			case 0: //horizontal axis
				if(event.value < 0)
					this.drone.left(-event.value/32767);
				else
					this.drone.right(event.value/32767);
				break;

			case 1: //vertical axis
				if(event.value > 0)
					this.drone.back(event.value/32767);
				else
					this.drone.front(-event.value/32767);
				break;
		}
	}

	switch(event.number) {
		case 3:
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
	this.latestNavData = navdata;
	if(this.log)
		this.loggedEvents.push(navdata);


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
