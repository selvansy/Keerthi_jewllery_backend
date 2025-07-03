import mongoose from 'mongoose';
import Counter from '../chit/companyModel.js';

const paymentstatusSchema = new mongoose.Schema(
  {
    id_status: {
      type: Number,
      required: true,
      default: 1,
    },
    payment_status: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
    remark: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

paymentstatusSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'payment_status' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.id_status = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('PaymentStatus', paymentstatusSchema);