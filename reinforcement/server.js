var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res) {
   res.sendfile('mariokart.html');
});
app.use(express.static(__dirname));

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   console.log('A user connected');
   //socket.emit('move', 1);

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
   socket.on('move', function(data) {
      socket.broadcast.emit('move', data);
   });
   socket.on('position', function(data) {
      socket.broadcast.emit('position', data);
	var res = data['x']+','+data['y']+','+data['rotation']+','+data['move']+'\n';
	fs.appendFile("./data/data.csv", res, function(err) {
	    if(err) {
		return console.log(err);
	    }
	});
   });
});

http.listen(3000, function() {
   console.log('listening on *:3000');
});
