const express = require('express');
const cors = require('cors');

const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello world!');
});

let userList = [];

io.on('connection', (socket) => {
    let { userName } = socket.handshake.query;

    if(!userList.includes(userName)) {
        userList.push(userName);
    }

    socket.broadcast.emit('user-list', [...userList]);
    socket.emit('user-list', [...userList]);

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', { message: msg, userName: userName });
    });

    socket.on('disconnect', (reason) => {
        if(userList.includes(userName)) {
            userList.splice(userList.indexOf(userName), 1);
        }
    });
})

http.listen(PORT, () => {
    console.log('Server is listening on port ', PORT);
})