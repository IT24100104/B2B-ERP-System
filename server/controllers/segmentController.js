const SegmentThresholds = require('../models/SegmentThresholds');

// GET /api/segments
// Access: Private (Admin & Sales)
const getSegments = async (req, res) => {
    try {
        const segments = await SegmentThresholds.find().sort({ minPurchase: 1 });
        res.json(segments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/segments/:id
// Access: Private (Admin only)
const updateSegment = async (req, res) => {
    try {
        const { minPurchase, maxPurchase, baseDiscount, incrementPerAmount, incrementUnit } = req.body;

        const segment = await SegmentThresholds.findById(req.params.id);

        if (segment) {
            if (minPurchase !== undefined) segment.minPurchase = minPurchase;
            if (maxPurchase !== undefined) segment.maxPurchase = maxPurchase;
            if (baseDiscount !== undefined) segment.baseDiscount = baseDiscount;
            if (incrementPerAmount !== undefined) segment.incrementPerAmount = incrementPerAmount;
            if (incrementUnit !== undefined) segment.incrementUnit = incrementUnit;

            const updatedSegment = await segment.save();
            res.json(updatedSegment);
        } else {
            res.status(404).json({ message: 'Segment not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating segment', error: error.message });
    }
};

module.exports = { getSegments, updateSegment };
