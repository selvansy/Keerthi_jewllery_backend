import mongoose from "mongoose";

const NotificationPromotionHistorySchema = new mongoose.Schema({
  type: { type: String, enum: ["push", "promotion"], required: true }, // Distinguish type
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // PushNotification or Promotion ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }], // Branch-based targeting
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Product-based targeting
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "NewArrivals" }, // New arrivals
  channel: { type: String, enum: ["sms", "email", "whatsapp", "push"] },
  token: String, // FCM token if pushNotification
  status: { type: String, enum: ["sent", "failed"], default: "sent" },
  sentAt: { type: Date, default: Date.now },
  errorMessage: String, // Store error if failed
  pushCount: {type: Number, default: 0},
  smsCount: {type: Number, default: 0},
  whatsappCount: {type: Number, default: 0},
  emailCount: {type: Number, default: 0},
}, { timestamps: true });

NotificationPromotionHistorySchema.index({ userId: 1, referenceId: 1 });
NotificationPromotionHistorySchema.index({ branchId: 1, productId: 1, categoryId: 1 });

export default mongoose.model("NotificationPromotionHistory", NotificationPromotionHistorySchema);
