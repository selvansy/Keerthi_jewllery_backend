import mongoose from 'mongoose';

const walletRateSettingsSchema = new mongoose.Schema({
    rupee_per_points: {
        type: Number,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    modified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }
}, {
    timestamps: true
});

export default mongoose.model('WalletRateSettings', walletRateSettingsSchema);