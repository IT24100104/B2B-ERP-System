const SegmentThresholds = require('../models/SegmentThresholds');

/**
 * Calculate dynamic segment and discount based on total purchase amount
 * @param {Number} totalPurchaseAmount 
 * @returns {Object} { segment: String, discountRate: Number }
 */
const calculateSegmentAndDiscount = async (totalPurchaseAmount) => {
    // Fetch all thresholds sorted by minPurchase descending (Platinum, Gold, Normal)
    // Assumes minPurchase uniquely defines the tier thresholds properly
    const thresholds = await SegmentThresholds.find().sort({ minPurchase: -1 });

    for (const threshold of thresholds) {
        if (totalPurchaseAmount >= threshold.minPurchase &&
            (threshold.maxPurchase === null || totalPurchaseAmount <= threshold.maxPurchase)) {

            let discountRate = threshold.baseDiscount;

            if (threshold.incrementUnit > 0) {
                // Calculate incremental discount based on purchase amount above the minimum
                const amountAboveMin = totalPurchaseAmount - threshold.minPurchase;
                const increments = Math.floor(amountAboveMin / threshold.incrementUnit);
                discountRate += (increments * threshold.incrementPerAmount);
            }

            return {
                segment: threshold.segmentName,
                discountRate: discountRate
            };
        }
    }

    // Default fallback
    return { segment: 'Normal', discountRate: 0 };
};

/**
 * Transform a customer document with dynamically calculated segment and discount
 * @param {Object} customer - Mongoose customer document or lean object
 * @returns {Object} transformed customer
 */
const applyDynamicSegmentation = async (customer) => {
    // Check if customer uses Mongoose toObject
    const customerObj = customer.toObject ? customer.toObject() : { ...customer };
    const { segment, discountRate } = await calculateSegmentAndDiscount(customerObj.totalPurchaseAmount || 0);

    customerObj.segment = segment;
    customerObj.discountRate = discountRate;

    return customerObj;
};

module.exports = {
    calculateSegmentAndDiscount,
    applyDynamicSegmentation
};
