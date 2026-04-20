const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const { calculateSegmentAndDiscount, applyDynamicSegmentation } = require('../services/segmentation');

// Helper: generate next invoice number
const generateInvoiceNumber = async () => {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    if (!lastInvoice || !lastInvoice.invoiceNumber) {
        return 'INV-0001';
    }
    const lastNum = parseInt(lastInvoice.invoiceNumber.replace('INV-', ''), 10);
    const nextNum = (isNaN(lastNum) ? 0 : lastNum) + 1;
    return `INV-${String(nextNum).padStart(4, '0')}`;
};

// GET /api/invoices
// Access: Private (Admin & Sales)
const getInvoices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const search = req.query.search || '';

        let query = {};
        if (search) {
            // Search by invoice number
            query.invoiceNumber = { $regex: search, $options: 'i' };
        }

        const total = await Invoice.countDocuments(query);
        const invoices = await Invoice.find(query)
            .populate('customer', 'name email segment totalPurchaseAmount')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            invoices,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalInvoices: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/invoices/:id
// Access: Private (Admin & Sales)
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('customer', 'name email phone country segment totalPurchaseAmount discountRate');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/invoices
// Access: Private (Sales Staff only)
const createInvoice = async (req, res) => {
    try {
        const { customerId, items } = req.body;

        // Validate customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }

        // Calculate item subtotals and grand subtotal
        let subtotal = 0;
        const processedItems = items.map(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            subtotal += itemSubtotal;
            return {
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: itemSubtotal
            };
        });

        // Calculate discount using EXISTING segmentation service
        // Based on what the customer's total WILL BE after this invoice
        const projectedTotal = customer.totalPurchaseAmount + subtotal;
        const { segment, discountRate } = await calculateSegmentAndDiscount(projectedTotal);

        const discountAmount = (subtotal * discountRate) / 100;
        const finalAmount = subtotal - discountAmount;

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();

        const invoice = new Invoice({
            invoiceNumber,
            customer: customerId,
            items: processedItems,
            subtotal,
            discountRate,
            discountAmount,
            finalAmount,
            customerSegmentAtCreation: segment,
            createdBy: req.user.id
        });

        const savedInvoice = await invoice.save();

        // Update customer's totalPurchaseAmount
        customer.totalPurchaseAmount += subtotal;

        // Recalculate segmentation using existing service
        const { segment: newSegment, discountRate: newDiscount } = await calculateSegmentAndDiscount(customer.totalPurchaseAmount);
        customer.segment = newSegment;
        customer.discountRate = newDiscount;
        await customer.save();

        // Populate customer details before responding
        const populatedInvoice = await Invoice.findById(savedInvoice._id)
            .populate('customer', 'name email segment totalPurchaseAmount');

        res.status(201).json(populatedInvoice);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create invoice', error: error.message });
    }
};

// PUT /api/invoices/:id
// Access: Private (Sales Staff only)
const updateInvoice = async (req, res) => {
    try {
        const { customerId, items } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Get the customer — revert old subtotal first
        const oldCustomer = await Customer.findById(invoice.customer);
        if (oldCustomer) {
            oldCustomer.totalPurchaseAmount -= invoice.subtotal;
            if (oldCustomer.totalPurchaseAmount < 0) oldCustomer.totalPurchaseAmount = 0;
            await oldCustomer.save();
        }

        // Validate new customer exists
        const customer = await Customer.findById(customerId || invoice.customer);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }

        // Calculate new subtotals
        let subtotal = 0;
        const processedItems = items.map(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            subtotal += itemSubtotal;
            return {
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: itemSubtotal
            };
        });

        // Calculate discount using existing segmentation service
        const projectedTotal = customer.totalPurchaseAmount + subtotal;
        const { segment, discountRate } = await calculateSegmentAndDiscount(projectedTotal);

        const discountAmount = (subtotal * discountRate) / 100;
        const finalAmount = subtotal - discountAmount;

        // Update invoice
        invoice.customer = customerId || invoice.customer;
        invoice.items = processedItems;
        invoice.subtotal = subtotal;
        invoice.discountRate = discountRate;
        invoice.discountAmount = discountAmount;
        invoice.finalAmount = finalAmount;
        invoice.customerSegmentAtCreation = segment;

        const savedInvoice = await invoice.save();

        // Update customer's totalPurchaseAmount with new subtotal
        customer.totalPurchaseAmount += subtotal;
        const { segment: newSegment, discountRate: newDiscount } = await calculateSegmentAndDiscount(customer.totalPurchaseAmount);
        customer.segment = newSegment;
        customer.discountRate = newDiscount;
        await customer.save();

        const populatedInvoice = await Invoice.findById(savedInvoice._id)
            .populate('customer', 'name email segment totalPurchaseAmount');

        res.json(populatedInvoice);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update invoice', error: error.message });
    }
};

// DELETE /api/invoices/:id
// Access: Private (Sales Staff only)
const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Revert customer's totalPurchaseAmount
        const customer = await Customer.findById(invoice.customer);
        if (customer) {
            customer.totalPurchaseAmount -= invoice.subtotal;
            if (customer.totalPurchaseAmount < 0) customer.totalPurchaseAmount = 0;

            // Recalculate segmentation
            const { segment, discountRate } = await calculateSegmentAndDiscount(customer.totalPurchaseAmount);
            customer.segment = segment;
            customer.discountRate = discountRate;
            await customer.save();
        }

        await invoice.deleteOne();
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice
};
