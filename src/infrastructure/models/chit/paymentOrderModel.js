import mongoose from "mongoose";

const PaymentOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  cf_payment_id: {
    type: String,
    default: null,
  },  
  cf_order_id: {
    type: String,
    required: true,
  },
  id_customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  payment_session_id: {
    type: String,
    required: true,
  },
  scheme_payment_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    }
  ],
  payment_amount: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    enum: [1, 2, 3], // 1 = success, 2 = pending, 3 = Failed
    default: 2,
  },
  cashfree_response: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  active: {
    type: Boolean,
    default: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

export default mongoose.model('PaymentOrder', PaymentOrderSchema);