const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Frontend files ke liye public folder ko static bana rahe hain
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Jab koi user message bhejega
    socket.on('send_message', (data) => {
        // Sabhi connected users ko message bhej do
        io.emit('receive_message', data);
    });

    // User disconnect hone par
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
