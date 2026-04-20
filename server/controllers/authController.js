const Admin = require('../models/Admin');
const SalesStaff = require('../models/SalesStaff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, username) => {
    return jwt.sign({ id, role, username }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check in Admin first
        let user = await Admin.findOne({ username });
        if (!user) {
            // Check in SalesStaff
            user = await SalesStaff.findOne({ username });
        }

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id, user.role, user.username),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { login };
