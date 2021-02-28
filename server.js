const express = require('express');
const http = require('http');
const cors = require('cors');

const PORT = process.env.PORT || 4000;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
	cors: {
		origin: '*',
	}
});

app.use(cors());

io.on('connection', socket => {
	const id = socket.handshake.query.id

	console.log(id);
	socket.join(id)

	socket.on('change-media', ({ media }) => {
		socket.broadcast.to(id).emit('update-media', media)
	})
})


server.listen(PORT, function () {
	console.log('listening on port 4000')
})
