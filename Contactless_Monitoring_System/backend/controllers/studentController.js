import Student from '../models/Student.js';
import Visitor from '../models/Visitor.js';
import Faculty from '../models/Faculty.js';
import EntryLog from '../models/EntryLog.js';
import crypto from 'crypto';

// Helper function to calculate Euclidean distance between two descriptors
const getEuclideanDistance = (desc1, desc2) => {
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        const diff = desc1[i] - desc2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};

// @desc    Register a new student with face encoding
// @route   POST /api/students/register
// @access  Private/Admin
export const registerStudent = async (req, res) => {
    const { student_id, name, email, college, department, course, section, face_encoding } = req.body;

    const exists = await Student.findOne({ student_id });
    if (exists) {
        res.status(400);
        throw new Error('Student ID already exists');
    }

    const qrPayload = JSON.stringify({
        studentId: student_id,
        type: 'Student',
        hash: crypto.randomBytes(16).toString('hex')
    });

    const student = await Student.create({
        student_id,
        name,
        email,
        college,
        department,
        course,
        section,
        face_encoding,
        qr_code: qrPayload
    });

    res.status(201).json({
        message: 'Student registered successfully',
        student: { id: student._id, name: student.name }
    });
};

// @desc    Match face and log entry
// @route   POST /api/students/match
// @access  Private/Security
export const matchFaceAndLog = async (req, res) => {
    const { descriptor, gate_location } = req.body;

    if (!descriptor || descriptor.length === 0) {
        res.status(400);
        throw new Error('Face descriptor is missing');
    }

    // Convert object/array back to Float32Array equivalent if needed
    const queryDescriptor = new Float32Array(Object.values(descriptor));

    // Fetch all students who have face encodings
    const students = await Student.find({ face_encoding: { $ne: [] } });
    const visitors = await Visitor.find({ approval_status: 'Approved', face_encoding: { $ne: [] } });
    const faculties = await Faculty.find({ face_encoding: { $ne: [] } });

    let bestMatch = null;
    let minDistance = 0.55; // Threshold for face-api matching (e.g., 0.6 is default, 0.55 is stricter)
    let personType = null;

    // Check students
    for (const student of students) {
        const savedDescriptor = new Float32Array(student.face_encoding);
        const distance = getEuclideanDistance(queryDescriptor, savedDescriptor);

        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = student;
            personType = 'Student';
        }
    }

    // Check visitors
    for (const visitor of visitors) {
        const savedDescriptor = new Float32Array(visitor.face_encoding);
        const distance = getEuclideanDistance(queryDescriptor, savedDescriptor);

        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = visitor;
            personType = 'Visitor';
        }
    }

    // Check faculty
    for (const faculty of faculties) {
        const savedDescriptor = new Float32Array(faculty.face_encoding);
        const distance = getEuclideanDistance(queryDescriptor, savedDescriptor);

        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = faculty;
            personType = 'Faculty';
        }
    }

    if (!bestMatch) {
        res.status(401);
        throw new Error('Face not recognized or match distance too high.');
    }

    // Process Entry/Exit Log
    const activeEntry = await EntryLog.findOne({
        person_id: bestMatch._id,
        person_type: personType,
        exit_time: null
    });

    if (activeEntry) {
        activeEntry.exit_time = Date.now();
        await activeEntry.save();
        res.json({
            message: `Exit logged for ${bestMatch.name} (${personType})`,
            log: activeEntry,
            action: 'exit',
            person: bestMatch.name,
            type: personType
        });
    } else {
        const newEntry = await EntryLog.create({
            person_type: personType,
            person_id: bestMatch._id,
            gate_location: gate_location || 'Main Gate Camera',
        });
        res.status(201).json({
            message: `Entry logged for ${bestMatch.name} (${personType})`,
            log: newEntry,
            action: 'entry',
            person: bestMatch.name,
            type: personType
        });
    }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
export const getStudents = async (req, res) => {
    const students = await Student.find({}).select('-face_encoding');
    res.json(students);
};

// @desc    Search students for manual entry
// @route   GET /api/students/search?q=
// @access  Private/Security
export const searchStudents = async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    const students = await Student.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { student_id: { $regex: q, $options: 'i' } }
        ]
    }).select('-face_encoding').limit(5);

    res.json(students);
};

// @desc    Manual Face Log
// @route   POST /api/students/manual-log
// @access  Private/Security
export const manualEntryLog = async (req, res) => {
    const { studentId, gate_location } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const activeEntry = await EntryLog.findOne({
        person_id: student._id,
        person_type: 'Student',
        exit_time: null
    });

    if (activeEntry) {
        activeEntry.exit_time = Date.now();
        await activeEntry.save();
        return res.json({
            message: `Manual Exit logged for ${student.name}`,
            log: activeEntry,
            action: 'exit',
            person: student.name
        });
    } else {
        const newEntry = await EntryLog.create({
            person_type: 'Student',
            person_id: student._id,
            gate_location: gate_location || 'Main Gate Camera',
        });
        return res.status(201).json({
            message: `Manual Entry logged for ${student.name}`,
            log: newEntry,
            action: 'entry',
            person: student.name
        });
    }
};
