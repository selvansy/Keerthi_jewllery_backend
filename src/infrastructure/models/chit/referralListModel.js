import mongoose from 'mongoose';

const referralListSchema = new mongoose.Schema({
    id_customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        required:false
    },
    referred_by: {
        type: String
    },
    id_employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Employee",
        required:false
    },
    id_scheme_account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"SchemeAccount"
    },
    mobile:{
        type:String
    },
    credited_amount: {
        type: Number,
        required: true
    },
    reward_mode: {
        type: Number,
        default: 1,
        enum: [1, 2]      // 1-Referral, 2-Purchase reward
    },
    active: {
        type: Boolean,
        default:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Employee"
    },
    modified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Employee"
    }
}, {
    timestamps: true
});

export default mongoose.model('ReferralList', referralListSchema);