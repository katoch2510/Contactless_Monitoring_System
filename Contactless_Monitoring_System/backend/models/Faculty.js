import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    faculty_id: {
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
    department: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Department'
    },
    face_encoding: {
        type: [Number],
        default: [],
    },
    qr_code: {
        type: String,
        unique: true,
    }
}, { timestamps: true });

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;
