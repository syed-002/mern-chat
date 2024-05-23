// controllers/chatController.js
const Message = require('../models/Message');
const User = require('../models/User');
const axios = require('axios');

const sendMessage = async (req, res) => {
    const { recipientId, content } = req.body;

    const recipient = await User.findById(recipientId);

    if (recipient.status === 'BUSY') {
        const response = await Promise.race([
            axios.post('https://api.llmprovider.com/generate', { prompt: content }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]).catch(() => 'User is currently unavailable.');

        const message = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content: response.data ? response.data.text : response,
        });

        await message.save();
        return res.status(201).json(message);
    } else {
        const message = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content
        });

        await message.save();
        return res.status(201).json(message);
    }
};

const getMessages = async (req, res) => {
    const { recipientId } = req.params;

    const messages = await Message.find({
        $or: [
            { sender: req.user._id, recipient: recipientId },
            { sender: recipientId, recipient: req.user._id }
        ]
    }).sort({ timestamp: 1 });

    res.json(messages);
};

module.exports = { sendMessage, getMessages };
