import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    college_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'College'
    }
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);
