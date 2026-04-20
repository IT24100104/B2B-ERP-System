require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const SalesStaff = require('../models/SalesStaff');
const Customer = require('../models/Customer');
const SegmentThresholds = require('../models/SegmentThresholds');

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing old data...');
        await Admin.deleteMany();
        await SalesStaff.deleteMany();
        await Customer.deleteMany();
        await SegmentThresholds.deleteMany();

        console.log('Inserting Segment Thresholds...');
        await SegmentThresholds.insertMany([
            { segmentName: 'Normal', minPurchase: 0, maxPurchase: 99999, baseDiscount: 0, incrementPerAmount: 0, incrementUnit: 0 },
            { segmentName: 'Gold', minPurchase: 100000, maxPurchase: 999999, baseDiscount: 4, incrementPerAmount: 0.5, incrementUnit: 100000 },
            { segmentName: 'Platinum', minPurchase: 1000000, maxPurchase: null, baseDiscount: 7, incrementPerAmount: 1, incrementUnit: 100000 },
        ]);

        console.log('Inserting Admin & Sales Staff...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        const admin = await Admin.create({
            username: 'admin',
            passwordHash,
            role: 'admin'
        });

        await SalesStaff.create({
            username: 'sales',
            passwordHash,
            role: 'sales_staff'
        });

        console.log('Inserting Mock Customers...');
        const mockCustomers = [];
        const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil'];

        for (let i = 1; i <= 25; i++) {
            // Generate random purchases: some normal (0-99k), some gold (100k-999k), some platinum (1M+)
            const rand = Math.random();
            let purchaseAmount = 0;
            if (rand < 0.4) purchaseAmount = Math.floor(Math.random() * 80000); // Normal
            else if (rand < 0.8) purchaseAmount = Math.floor(Math.random() * 800000) + 100000; // Gold
            else purchaseAmount = Math.floor(Math.random() * 2000000) + 1000000; // Platinum

            mockCustomers.push({
                name: `Customer ${i} ${countries[Math.floor(Math.random() * countries.length)]}`,
                email: `customer${i}@example.com`,
                phone: `+1-555-01${i.toString().padStart(2, '0')}`,
                country: countries[Math.floor(Math.random() * countries.length)],
                totalPurchaseAmount: purchaseAmount,
                createdBy: admin._id
            });
        }

        await Customer.insertMany(mockCustomers);

        console.log('Data Imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
