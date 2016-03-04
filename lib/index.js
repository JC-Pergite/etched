'use strict';

const express = require('express');
const http = require('http');

const app = express();
const server = new http.Server(app);
const io = require('socket.io')(server);


let port = parseFloat(process.env.PORT) || 3000;

app.use('/', express.static(`${__dirname}/public`));

function lookup_session_token (session_token, callback) {
	callback(null, {
		id: 1
	})
}

io.use((socket, next) => {
	let session_token = socket.handshake.query.session_token;

	lookup_session_token(session_token,(err, user) => {
		if (!user || err)
			return next(err || new Error('Invalid session token'));

		socket.user = user;

		socket.on('move', (x, y) => {
			console.log(`${socket.user.id} made a movement ${x} ${y}`);
		});

		next();
	});
});	

console.log(`listening on ${port}`)
server.listen(port);