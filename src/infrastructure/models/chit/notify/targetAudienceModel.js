import mongoose from "mongoose";

const TargetAudienceSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PushNotification",
    required: false,
  },
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion",
    required: false,
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  }],
  fcmTokens: [String],
  createdAt: { type: Date, default: Date.now },
});

TargetAudienceSchema.index({ notificationId: 1, promotionId: 1 });
TargetAudienceSchema.index({ targetUsers: 1 });

export default mongoose.model("TargetAudience", TargetAudienceSchema);
