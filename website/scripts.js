var ctx = null;
var previousPoint = {x:320,y:320};

var ws;

window.addEventListener('load', function() {
	ws = new WebSocket("ws://"+location.host);
	ws.addEventListener('message', gotMessage);
	ctx = document.getElementById('graphCanvas').getContext('2d');
});

function gotMessage(event) {
	var data = JSON.parse(event.data);

	var x = 320 + data.north/2000000*320;
	var y = 320 + data.east/2000000*320;
		
	ctx.beginPath();
	ctx.moveTo(previousPoint.x,previousPoint.y);
	ctx.lineTo(x,y);
	previousPoint = {x:x,y:y};
	ctx.stroke();
}
