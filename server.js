const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 4000;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
	cors: {
		origin: '*',
	}
});

app.use(cors());

let roomData = {};

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'));
}

app.get('*', (request, response) => {
	response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

io.on('connection', socket => {
	const id = socket.handshake.query.id;

	socket.join(id);

	if (roomData[id]) {
		socket.local.emit('user-joined', roomData[id]);
	}

	socket.on('change-media', ({ media }) => {

		roomData[id] = media;

		socket.broadcast.to(id).emit('update-media', media);
	});
});


server.listen(PORT, function () {
	console.log('listening on port 4000');
});
