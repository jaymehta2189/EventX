const socketIo = require('socket.io');
const redisAdapter = require('socket.io-redis');
const {pubClient,subClient} = require("./configRedis.js");

let io = null; 

const socketConfig = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.adapter(redisAdapter({ pubClient, subClient }));

    io.on('connection', (socket) => {

        socket.on('join-room', (roomName) => {
            socket.join(roomName);
            console.log(`${socket.id} joined room: ${roomName}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

const broadcastToRoom = (roomName, data) => {
    if (io != null) {
        io.to(roomName).emit('receive-data', data);
    } else {
        console.error('Socket.IO instance is not initialized.');
    }
};

const broadcastToAll = (data) => {
    if (io != null) {
        io.emit('receive-data', data);
    } else {
        console.error('Socket.IO instance is not initialized.');
    }
};

module.exports = {
    socketConfig,
    broadcastToRoom,
    broadcastToAll
};