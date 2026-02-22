const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'insureops-ai-jwt-secret-dev-2026';

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Require specific role(s) to access a route.
 * Usage: requireRole('admin', 'compliance_officer')
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `This action requires one of: ${roles.join(', ')}`,
                yourRole: req.user.role
            });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
