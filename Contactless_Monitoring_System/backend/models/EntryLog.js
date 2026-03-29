import mongoose from 'mongoose';

const entryLogSchema = new mongoose.Schema({
    person_type: {
        type: String,
        enum: ['Student', 'Visitor', 'Admin'],
        required: true,
    },
    person_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'person_type', // Dynamic reference based on person_type
    },
    entry_time: {
        type: Date,
        default: Date.now,
    },
    exit_time: {
        type: Date,
        default: null, // null means they are still inside
    },
    gate_location: {
        type: String,
        default: 'Main Gate',
    }
}, { timestamps: true });

const EntryLog = mongoose.model('EntryLog', entryLogSchema);
export default EntryLog;
