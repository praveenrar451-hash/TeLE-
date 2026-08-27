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

let messageHistory = [];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.emit('load_history', messageHistory);

    // Message receive aur broadcast karna
    socket.on('send_message', (data) => {
        const messageWithTime = { 
            ...data, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent' // Default status sent
        };
        
        messageHistory.push(messageWithTime);
        if (messageHistory.length > 200) messageHistory.shift();

        // Sabhi ko message bhejo
        io.emit('receive_message', messageWithTime);
    });

    // --- TYPING INDICATOR LOGIC ---
    socket.on('typing', (username) => {
        // Apne alawa baaki sabhi ko batao ki ye user type kar raha hai
        socket.broadcast.emit('display_typing', username);
    });

    socket.on('stop_typing', () => {
        socket.broadcast.emit('hide_typing');
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
