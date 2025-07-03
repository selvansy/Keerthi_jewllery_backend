import mongoose from 'mongoose'

const customerrewardSchema = new mongoose.Schema({
    typeofcustomer: {
        type: Number,
        enum: [1, 2],   // 1-Customer, 2-Employee
    },
    id_scheme_account: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'SchemeAccount',
        required: true
    },
    bill_no: {
        type: String,
    },
    bill_date: {
        type: String,
    },
    referral_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required: true
    },
    referral_by: {
        type: Number,
    },
    reward_amount: {
        type: Number,
    },
    purchase_weight: {
        type: Number,
        default: 0
    },
    type_of_reward: {
        type: Number,
        required: true,
        default: 1,
        enum: [1, 2]  // 1-Referral Reward, 2-Purchase Reward
    },
    scheme_status: {  // is reward payment completed
        type: Number,
        enum: [0, 1], // 0-Unpaid in Scheme, 1-Paid in Scheme
        default:0
    },
    id_branch: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Branch'
    },
    active: {
        type: Boolean,
        default: true
    },
    is_deleted:{
        type:Boolean,
        default:false,
    },
    create_date: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('CustomerReward', customerrewardSchema)