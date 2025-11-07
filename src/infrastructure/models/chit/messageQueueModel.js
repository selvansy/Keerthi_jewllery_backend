import mongoose from "mongoose";

const messageQueueSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  mobile: { type: String },
  name: { type: String },
  messageType: { type: Number, enum: [1, 2], required: true }, 
  message: { type: String, required: true },

  cronStatus: { type: Number, default: 1 },   // 1 = entry created by cron
  sendStatus: { type: Number, default: 2 },   // 2 = not sent, 1 = sent

  scheduledAt: { type: Date },    // 8 AM schedule
  sentAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("MessageQueue", messageQueueSchema);
