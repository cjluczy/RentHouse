const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    sourceProperty: {
        type: String,
        required: true
    },
    authStatus: {
        type: String,
        enum: ['已实名', '待认证'],
        default: '待认证'
    },
    createTime: {
        type: String,
        default: new Date().toISOString().split('T')[0]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);