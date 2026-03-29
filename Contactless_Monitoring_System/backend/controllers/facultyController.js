import Faculty from '../models/Faculty.js';
import crypto from 'crypto';

// @desc    Register a new faculty with face encoding
// @route   POST /api/faculty/register
// @access  Private/Admin
export const registerFaculty = async (req, res) => {
    const { faculty_id, name, email, department, face_encoding } = req.body;

    const exists = await Faculty.findOne({ faculty_id });
    if (exists) {
        res.status(400);
        throw new Error('Faculty ID already exists');
    }

    const qrPayload = JSON.stringify({
        facultyId: faculty_id,
        type: 'Faculty',
        hash: crypto.randomBytes(16).toString('hex')
    });

    const faculty = await Faculty.create({
        faculty_id,
        name,
        email,
        department,
        face_encoding,
        qr_code: qrPayload
    });

    res.status(201).json({
        message: 'Faculty registered successfully',
        faculty: { id: faculty._id, name: faculty.name }
    });
};

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
export const getFaculty = async (req, res) => {
    const faculty = await Faculty.find({}).populate('department', 'name').select('-face_encoding');
    res.json(faculty);
};

// @desc    Search faculty for manual entry
// @route   GET /api/faculty/search?q=
// @access  Private/Security
export const searchFaculty = async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    const faculty = await Faculty.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { faculty_id: { $regex: q, $options: 'i' } }
        ]
    }).select('-face_encoding').limit(5);

    res.json(faculty);
};
