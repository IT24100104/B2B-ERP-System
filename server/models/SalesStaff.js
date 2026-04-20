const mongoose = require('mongoose');

const salesStaffSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'sales_staff' }
});

module.exports = mongoose.model('SalesStaff', salesStaffSchema);
