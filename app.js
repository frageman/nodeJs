const app = require('express')();
const fs = require('fs');
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
var cors = require('cors')

const hostname = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
const port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

let numberOfOnlineUsers = 0;
let userMap = new Map();
let videoName = "";

io.sockets.on('connect', function(client) {

	console.log(" play")
  	  
	io.emit('numberOfOnlineUsers', numberOfOnlineUsers);
	io.emit('userMap', Array.from(userMap)); //socket.io (or whatever transport mechanism) is probably using JSON as the serialization format. Unfortunately, Maps and Sets and other ES2015 datatypes cannot be JSON-encoded.
	
    client.on('disconnect', function() {
		if(userMap.get(client.id) != null){
			numberOfOnlineUsers--;
			io.emit('numberOfOnlineUsers', numberOfOnlineUsers);
			io.emit('disconnectUserId', userMap.get(client.id));
			console.log('User is disconnect ' + userMap.get(client.id))
		}  
		userMap.delete(client.id);
		io.emit('numberOfOnlineUsers', numberOfOnlineUsers);
        io.emit('userMap', Array.from(userMap));
    }); 
	  

  // Add the user and send it to everyone
	client.on('userMap:add', item => {
		numberOfOnlineUsers++;
		userMap.set(client.id, item);
		 console.log('User is connected: ' + item)
		io.emit('userMap', Array.from(userMap));
		io.emit('numberOfOnlineUsers', numberOfOnlineUsers);

  });

  // Remove the user and send the id to everyone
	client.on('userMap:remove', id => {
		numberOfOnlineUsers--;
		userMap.delete(client.id);
		console.log('User is disconnect ' + id)
		io.emit('userMap', Array.from(userMap));
		io.emit('numberOfOnlineUsers', numberOfOnlineUsers);
		io.emit('disconnectUserId', id);
	});
	
	client.on('videoName:set', item => {
		console.log(item);
		io.emit('videoName:get', item);
	});
	
	
  
});

  http.listen(port, hostname, function () {
    console.log('Listening on port 4444!')
});
