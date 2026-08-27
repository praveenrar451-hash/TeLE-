const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Server par last 200 messages store rakhne ke liye array
let messageHistory = [];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Naye user ko pichle 200 messages bhej do
    socket.emit('load_history', messageHistory);

    socket.on('send_message', (data) => {
        const messageWithTime = { 
            ...data, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        
        messageHistory.push(messageWithTime);
        
        // Limit ko badha kar 200 kar diya hai
        if (messageHistory.length > 200) {
            messageHistory.shift();
        }

        io.emit('receive_message', messageWithTime);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
