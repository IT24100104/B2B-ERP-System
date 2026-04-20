const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { salesOnly } = require('../middleware/salesOnly');

// GET all invoices — admin + sales_staff
router.get('/', protect, getInvoices);

// GET single invoice — admin + sales_staff
router.get('/:id', protect, getInvoiceById);

// POST create — sales_staff only
router.post('/', protect, salesOnly, createInvoice);

// PUT update — sales_staff only
router.put('/:id', protect, salesOnly, updateInvoice);

// DELETE — sales_staff only
router.delete('/:id', protect, salesOnly, deleteInvoice);

module.exports = router;
