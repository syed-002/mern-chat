const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { protect } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Mock LLM response function
const mockLLMResponse = async (prompt) => {
    return new Promise((resolve) => {
        const timeout = Math.random() * (15000 - 5000) + 5000;
        setTimeout(() => {
            resolve('This is a mock response from the LLM based on user input');
        }, timeout);
    });
};

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded.id;
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('User connected', socket.user);

    socket.on('sendMessage', async ({ recipientId, content }) => {
        const senderId = socket.user;
        const recipient = await User.findById(recipientId);

        let messageContent = content;

        if (recipient.status === 'BUSY') {
            try {
                const response = await Promise.race([
                    axios.post('https://api.llmprovider.com/generate', { prompt: content }),
                    mockLLMResponse(content)
                ]);
                messageContent = response.data ? response.data.text : response;
            } catch (error) {
                messageContent = 'User is currently unavailable.';
            }
        }

        const message = new Message({
            sender: senderId,
            recipient: recipientId,
            content: messageContent
        });

        await message.save();

        io.to(recipientId).emit('messageReceived', message);
        socket.emit('messageSent', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.user);
    });
});

const PORT = process.env.PORT;


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
