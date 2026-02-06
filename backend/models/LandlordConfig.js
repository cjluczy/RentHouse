const mongoose = require('mongoose');

const landlordConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    wechatId: {
        type: String,
        required: true
    },
    qrCodeUrl: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LandlordConfig', landlordConfigSchema);