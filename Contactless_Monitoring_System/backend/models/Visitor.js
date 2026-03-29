import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
    visitor_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        required: true,
    },
    visit_date: {
        type: Date,
        required: true,
    },
    approval_status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    qr_code: {
        type: String,
        unique: true,
    }
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;
