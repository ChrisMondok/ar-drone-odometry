//Control the ar drone with an xbox 360 controller

var arDrone = require('ar-drone');

function droneController(drone) {
	this.js = new(require('joystick'))(0,10000,350);

	this.js.on('button', this.buttonPressed.bind(this));
	this.js.on('axis', this.axisMoved.bind(this));

	this.drone = drone ||  new (arDrone).createClient();

	this.drone.on('navdata',this.gotNavData.bind(this));

	this.control = arDrone.createUdpControl();
	setInterval(this.tick.bind(this), 30);

	this.cardinal = false;
	this.log = false;
	this.loggedEvents = [];

	this.latestNavData = null;

	this.front = this._lastFront = 0;
	this.right = this._lastRight = 0;
	this.up = this._lastUp = 0;
	this.clockwise = this._lastClockwise = 0;

	this.joyX = 0;
	this.joyY = 0;

	this.faceSticker = false;
}

droneController.prototype.tick = function() {
	if(this.front === 0 && this.right === 0 && ( this.front != this._lastFront || this.right != this._lastRight)) {
		this.drone.stop();
	}

	if(this.front != this._lastFront)
		this.drone.front(this.front);
	
	if(this.right != this._lastRight)
		this.drone.right(this.right);

	if(this.up != this._lastUp)
		this.drone.up(this.up);

	if(this.clockwise != this._lastClockwise)
		this.drone.clockwise(this.clockwise);

	this._lastUp = this.up;
	this._lastRight = this.right;
	this._lastFront = this.front;
	this._lastClockwise = this.clockwise;

	this.control.flush();
};

droneController.prototype.buttonPressed = function(event) {
	if(event.value)
		switch(event.number) {
			case 0:
				console.log("Stop");
				this.drone.stop();
				break;
			case 3:
				console.log('Toggle facing');
				this.toggleFacing();
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

		this.right = this.joyX * Math.cos(heading) - this.joyY * Math.sin(heading);
		this.front = -(this.joyX * Math.sin(heading) + this.joyY * Math.cos(heading));
	}
	else
	{
		switch(event.number) {
			case 0: //horizontal axis
				this.right = event.value/32767;
				break;
			case 1: //vertical axis
				this.front = -event.value/32767;
				break;
		}
	}

	switch(event.number) {
		case 3:
			if(!this.faceSticker)
				this.clockwise = event.value/32767;
			break;
		case 5:
			this.up = (event.value+32767)/65535;
			break;
		case 2:
			this.up = -((event.value+32767)/65535);
			break;
	}
};

droneController.prototype.gotNavData = function(navdata) {
	this.latestNavData = navdata;
	if(this.log)
		this.loggedEvents.push(navdata);
	if(this.faceSticker) {
		this.clockwise = 0;
		if('visionDetect' in navdata) {
			if(navdata.visionDetect.nbDetected) {
				var v = navdata.visionDetect;
				var x = ((v.xc[0] / 1000) - 0.5)*2;
				var y = ((v.yc[0] / 1000) - 0.5)*2;
				var d = (v.dist[0] - 100)/400;

				var clamped = Math.min(Math.max(-0.2, d), 0.2);

				this.front = clamped;
				this.clockwise = x;

				console.log(this.front);
			}
			else
				console.warn("Sticker not detected");
		}
		else
			console.warn("visionDetect not in navdata");
	}


};

droneController.prototype.toggleFacing = function() {
	this.faceSticker = !this.faceSticker;
};

droneController.prototype.toggleLogging = function() {
	this.log = !this.log;
	console.log(this.log?"Enable":"Disable","logging");
	if(!this.log) {
		require('fs').writeFile('navdata',JSON.stringify(this.loggedEvents));
		this.loggedEvents = [];
	}
};

exports.droneController = droneController;
