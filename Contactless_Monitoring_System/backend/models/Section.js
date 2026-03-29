import mongoose from 'mongoose';

const sectionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
    }
}, { timestamps: true });

export default mongoose.model('Section', sectionSchema);
