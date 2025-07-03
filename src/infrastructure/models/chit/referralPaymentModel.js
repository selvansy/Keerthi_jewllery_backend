import mongoose, { Schema } from 'mongoose';

const referralPaymentSchema = new Schema({
  // id_referral: { type: Schema.Types.ObjectId, required: true, ref: 'Referral' },
  id_employee: { type: Schema.Types.ObjectId, required: true, ref: 'Employee' },
  paid_amount: { type: Number,default:0},
  balance_amount:{type:Number,default:0},
  active: { type: Boolean, default: true },
  is_deleted:{type:Boolean,default:false},
  created_by: { type: Schema.Types.ObjectId, required: true, ref: 'Employee' },
  modified_by: { type: Schema.Types.ObjectId, required: true, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('ReferralPayment', referralPaymentSchema);