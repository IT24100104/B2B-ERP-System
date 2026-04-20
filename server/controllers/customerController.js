const Customer = require('../models/Customer');
const { applyDynamicSegmentation } = require('../services/segmentation');

// GET /api/customers
// Access: Private (Admin & Sales)
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ totalPurchaseAmount: -1 }).populate('createdBy', 'username');

        // Apply dynamic segmentation to each customer
        const segmentedCustomers = await Promise.all(
            customers.map(async (c) => await applyDynamicSegmentation(c))
        );

        res.json(segmentedCustomers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/customers
// Access: Private (Admin only)
const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, country } = req.body;

        const customer = new Customer({
            name,
            email,
            phone,
            country,
            createdBy: req.user.id
        });

        const createdCustomer = await customer.save();

        const segmentedCustomer = await applyDynamicSegmentation(createdCustomer);
        res.status(201).json(segmentedCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

// PUT /api/customers/:id
// Access: Private (Admin only)
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            customer.name = req.body.name || customer.name;
            customer.email = req.body.email || customer.email;
            customer.phone = req.body.phone || customer.phone;
            customer.country = req.body.country || customer.country;

            const updatedCustomer = await customer.save();
            const segmentedCustomer = await applyDynamicSegmentation(updatedCustomer);

            res.json(segmentedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating', error: error.message });
    }
};

// DELETE /api/customers/:id
// Access: Private (Admin only)
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            await customer.deleteOne();
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PATCH /api/customers/:id/purchase
// Access: Private (Any internal component with auth)
const addPurchase = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Purchase amount must be greater than 0' });
        }

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { $inc: { totalPurchaseAmount: amount } },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const segmentedCustomer = await applyDynamicSegmentation(customer);

        res.json(segmentedCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addPurchase
};
