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

	if('east' in data && 'north' in data)
	{
		var x = 320 + data.north/2000000*320;
		var y = 320 + data.east/2000000*320;
			
		ctx.beginPath();
		ctx.moveTo(previousPoint.x,previousPoint.y);
		ctx.lineTo(x,y);
		previousPoint = {x:x,y:y};
		ctx.stroke();
	}

	if('image' in data) {
		document.getElementById('camera').src = 'data:image/'+data.image.type+';base64,'+data.image.src;
	}
	
	if('battery' in data)
		document.getElementById('battery').value = data.battery;

	if('heading' in data)
		document.getElementById('compass').style.transform = "rotate("+data.heading/Math.PI*180+"deg)";
	
}
