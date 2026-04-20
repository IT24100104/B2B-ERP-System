const mongoose = require('mongoose');

const segmentThresholdsSchema = new mongoose.Schema({
    segmentName: { type: String, required: true, enum: ['Normal', 'Gold', 'Platinum'] },
    minPurchase: { type: Number, required: true },
    maxPurchase: { type: Number, default: null }, // use null for infinity
    baseDiscount: { type: Number, required: true },
    incrementPerAmount: { type: Number, required: true },
    incrementUnit: { type: Number, required: true }
});

module.exports = mongoose.model('SegmentThresholds', segmentThresholdsSchema);
