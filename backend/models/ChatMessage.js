const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    sender: {
        type: String,
        enum: ['user', 'landlord'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        default: new Date().toISOString()
    },
    isRead: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);