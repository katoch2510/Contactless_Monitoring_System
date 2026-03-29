import mongoose from 'mongoose';

const courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Department'
    }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
