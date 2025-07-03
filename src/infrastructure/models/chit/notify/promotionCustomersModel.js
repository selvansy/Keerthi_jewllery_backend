import mongoose from 'mongoose'

const PromotionCustomerSchema = new mongoose.Schema({
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion",
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },
  smsSent: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  whatsappSent: { type: Boolean, default: false },
  pushSent: { type: Boolean, default: false },
  failed: { type: Boolean, default: false }, 
}, {
  timestamps: true
});


PromotionCustomerSchema.index({ promotionId: 1, customerId: 1 }, { unique: true });

export default mongoose.model("PromotionCustomer", PromotionCustomerSchema);