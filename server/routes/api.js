const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { getCustomers, createCustomer, updateCustomer, deleteCustomer, addPurchase } = require('../controllers/customerController');
const { getSegments, updateSegment } = require('../controllers/segmentController');
const { protect, adminOnly } = require('../middleware/auth');

// Auth Routes
router.post('/auth/login', login);

// Customer Routes
router.route('/customers')
    .get(protect, getCustomers)
    .post(protect, adminOnly, createCustomer);

router.route('/customers/:id')
    .put(protect, adminOnly, updateCustomer)
    .delete(protect, adminOnly, deleteCustomer);

router.patch('/customers/:id/purchase', protect, addPurchase);

// Segment Routes
router.route('/segments')
    .get(protect, getSegments);

router.route('/segments/:id')
    .put(protect, adminOnly, updateSegment);

// Invoice Routes (delegated to dedicated router)
router.use('/invoices', require('./invoiceRoutes'));

module.exports = router;
