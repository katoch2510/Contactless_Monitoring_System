import crypto from 'crypto';
import Visitor from '../models/Visitor.js';

// @desc    Register a new visitor
// @route   POST /api/visitors/register
// @access  Public
export const registerVisitor = async (req, res) => {
    const { name, phone, email, purpose, visit_date, face_encoding, photo_base64 } = req.body;

    // Generate a 6-digit visitor ID
    const visitor_id = Math.floor(100000 + Math.random() * 900000).toString();

    const visitor = await Visitor.create({
        visitor_id,
        name,
        phone,
        email,
        purpose,
        visit_date,
        face_encoding,
        photo_base64
    });

    if (visitor) {
        res.status(201).json({
            message: 'Visitor registered successfully. Pending approval.',
            visitorId: visitor._id,
        });
    } else {
        res.status(400);
        throw new Error('Invalid visitor data');
    }
};

// @desc    Get all pending visitors
// @route   GET /api/visitors/pending
// @access  Private/Admin
export const getPendingVisitors = async (req, res) => {
    const visitors = await Visitor.find({ approval_status: 'Pending' });
    res.json(visitors);
};

// @desc    Approve or reject a visitor
// @route   PUT /api/visitors/:id/status
// @access  Private/Admin
export const updateVisitorStatus = async (req, res) => {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const visitor = await Visitor.findById(req.params.id);

    if (visitor) {
        visitor.approval_status = status;

        if (status === 'Approved') {
            // Embed the 6-digit visitor_id in the QR
            const qrPayload = JSON.stringify({
                visitorId: visitor.visitor_id,
                type: 'Visitor',
                hash: crypto.randomBytes(8).toString('hex')
            });
            visitor.qr_code = qrPayload;
        } else if (status === 'Rejected') {
            visitor.qr_code = null;
        }

        const updatedVisitor = await visitor.save();
        res.json({
            message: `Visitor ${status.toLowerCase()}`,
            visitor: updatedVisitor,
        });
    } else {
        res.status(404);
        throw new Error('Visitor not found');
    }
};

// @desc    Get all visitors
// @route   GET /api/visitors
// @access  Private/Admin
export const getVisitors = async (req, res) => {
    const visitors = await Visitor.find({});
    res.json(visitors);
};
