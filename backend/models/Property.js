const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    area: {
        type: Number,
        default: 0
    },
    layout: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    imageUrls: [{
        type: String
    }],
    videoUrl: {
        type: String,
        default: ''
    },
    hasVideo: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['招租中', '已预定', '已成交', '已下架'],
        default: '招租中'
    },
    publishDate: {
        type: String,
        default: new Date().toISOString().split('T')[0]
    },
    appointments: [{
        name: String,
        time: String,
        staff: String,
        confirmed: Boolean
    }],
    description: {
        type: String,
        default: ''
    },
    coords: {
        type: [Number],
        default: [0, 0]
    },
    isNewProperty: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);