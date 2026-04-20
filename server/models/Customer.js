const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    totalPurchaseAmount: { type: Number, default: 0 },
    segment: { type: String, default: 'Normal' },
    discountRate: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
});

module.exports = mongoose.model('Customer', customerSchema);
