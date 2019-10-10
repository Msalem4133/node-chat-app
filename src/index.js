const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generatLocationeMessage
} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', socket => {
  console.log('New Web socket');
  // socket.emit('message', generateMessage('Welcome !'));
  // socket.broadcast.emit('message', generateMessage('A new user has joined'));
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit('message', generateMessage('ADMIN', 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('ADMIN', `${user.username} has joined!`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('profanity isnot allowed');
    }
    const user = getUser(socket.id);
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'LocationMessage',
      generatLocationeMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('ADMIN', `${user.username} has left !!11`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
