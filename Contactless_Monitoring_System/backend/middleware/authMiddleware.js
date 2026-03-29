import jwt from 'jsonwebtoken';
import { asyncHandler } from './asyncHandler.js';
import Admin from '../models/Admin.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Read the JWT from the cookie
    token = req.cookies?.jwt;

    // Also support bearer token for testing/clients without cookies
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = await Admin.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Admin role check middleware
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (req.admin && roles.includes(req.admin.role)) {
            next();
        } else {
            res.status(403);
            throw new Error('Not authorized to access this route');
        }
    };
};
