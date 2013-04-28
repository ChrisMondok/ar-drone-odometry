function odometry() {
	this.north = 0;
	this.east = 0;
	this.lastDataTime = 0;
}

odometry.prototype.update = function(navdata) {
	if('magneto' in navdata && this.lastDataTime)
	{
		var dt = navdata.time - this.lastDataTime;

		var heading = navdata.magneto.heading.fusionUnwrapped * Math.PI/180;
		var front = navdata.demo.velocity.x;
		var right = navdata.demo.velocity.y;

		var east = right * Math.cos(heading) - front * Math.sin(heading);
		var north = right * Math.sin(heading) + front * Math.cos(heading);

		this.north += (north * dt);
		this.east += (east * dt);
	}
	this.lastDataTime = navdata.time;
}

exports.odometry = odometry;
