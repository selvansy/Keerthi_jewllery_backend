import mongoose, { Schema } from 'mongoose';

const billredeemrewardSchema = new mongoose.Schema({
    id_customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Customer'
    },
    bill_no: {
        type: String,
        required: true
    },
    bill_date: {
        type: String,
        required: true
    },
    redeem_amount: {
        type: Schema.Types.Decimal128,
        requrired: true
    },
    id_branch: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Branch'
    },
    active: {
        type: Number,
        required: true,
        default: 1
    },
    create_date: {
        type: Date,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Employee"
    },
    modified_date: {
        type: Date,
        required: true
    },
    modified_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Employee"
    }
}, {
    timestamps: true
})

export default mongoose.model('BillRedeemReward', billredeemrewardSchema);