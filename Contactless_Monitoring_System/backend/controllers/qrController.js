import Visitor from '../models/Visitor.js';
import Student from '../models/Student.js';
import EntryLog from '../models/EntryLog.js';

// @desc    Scan QR code and log entry/exit
// @route   POST /api/qr/scan
// @access  Private/Security
export const scanQR = async (req, res) => {
    const { qr_payload } = req.body; // Passed from frontend scanner

    if (!qr_payload) {
        res.status(400);
        throw new Error('No QR code provided');
    }

    try {
        const payload = JSON.parse(qr_payload);
        const { visitorId, studentId, type } = payload;

        let person;
        let pId;

        if (type === 'Visitor') {
            person = await Visitor.findOne({ _id: visitorId, qr_code: qr_payload });
            if (!person) {
                res.status(404);
                throw new Error('Invalid or expired Visitor QR code');
            }
            if (person.approval_status !== 'Approved') {
                res.status(403);
                throw new Error('Visitor is not approved for entry');
            }
            pId = person._id;
        } else if (type === 'Student') {
            person = await Student.findOne({ _id: studentId, qr_code: qr_payload });
            if (!person) {
                res.status(404);
                throw new Error('Invalid Student QR code');
            }
            pId = person._id;
        } else {
            res.status(400);
            throw new Error('Invalid QR format');
        }

        // Check if there's an active entry without an exit
        const activeEntry = await EntryLog.findOne({
            person_id: pId,
            person_type: type,
            exit_time: null
        });

        if (activeEntry) {
            // It's an exit scan
            activeEntry.exit_time = Date.now();
            await activeEntry.save();
            res.json({
                message: `${type} exit logged successfully`,
                log: activeEntry,
                action: 'exit'
            });
        } else {
            // It's an entry scan
            const newEntry = await EntryLog.create({
                person_type: type,
                person_id: pId,
                gate_location: req.body.gate_location || 'Main Gate',
            });
            res.status(201).json({
                message: `${type} entry logged successfully`,
                log: newEntry,
                action: 'entry'
            });
        }
    } catch (error) {
        res.status(400);
        throw new Error('Failed to process QR code. Validation Error.');
    }
};

// @desc    Get all entry logs
// @route   GET /api/qr/logs
// @access  Private/Admin
export const getLogs = async (req, res) => {
    const logs = await EntryLog.find()
        .populate('person_id', 'name email department phone')
        .sort({ createdAt: -1 });
    res.json(logs);
};
