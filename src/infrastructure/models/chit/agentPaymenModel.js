import mongoose from "mongoose";

const agenpaymentSchema = new mongoose.Schema({
    id_employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Employee'
    },
    paid_amount: {
        type: Number,
        required: true
    },
    active: {
        type: Number,
        required: true,
        default: 1
    },
    incentive_fromdate: {
        type: String,
        required: true
    },
    incentive_today: {
        type: String,
        required: true
    },
    incentive_month: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        requried: true,
        ref:'Employee'
    },
    modified_date: {
        type: Date,
        required: true
    },
    modified_by: {
        type: mongoose.Schema.Types.ObjectId,
        requried: true,
        ref:'Employee'
    }
}, {
    timestamps: true
});

export default mongoose.model('AgentPayment', agenpaymentSchema);