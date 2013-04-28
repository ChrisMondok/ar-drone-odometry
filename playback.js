var odometry = new (require('odometry.js')).odometry();

console.log("Loading");
var navdata = JSON.parse(require('fs').readFileSync('navdata'));

console.log("Flying");
for(var i = 0; i < navdata.length; i++)
{
	console.log("North:",odometry.north);
	//console.log("East: ",odometry.east);
	odometry.update(navdata[i]);
}

