import mongoose from "mongoose";

const FcmTokenSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
  token: { type: String, required: true, unique: true },
  deviceType: { type: String, enum: ["android", "ios", "web"], required: false, default: 'android' },
  lastUsedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
}, { timestamps: true });
FcmTokenSchema.index({ customerId: 1 });
export default mongoose.model("FcmToken", FcmTokenSchema);
