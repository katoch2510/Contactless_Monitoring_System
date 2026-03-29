import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'College'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Department'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Section'
    },
    face_encoding: {
        type: [Number], // Corrected from Array,[Number] for valid Mongoose schema syntax
        default: [],
    },
    qr_code: {
        type: String, // String representation of payload or generated identifier
        unique: true,
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
