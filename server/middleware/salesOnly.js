/**
 * Middleware: allows only sales_staff role
 * Use AFTER the protect middleware
 */
const salesOnly = (req, res, next) => {
    if (req.user && req.user.role === 'sales_staff') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized — sales staff only' });
    }
};

module.exports = { salesOnly };
