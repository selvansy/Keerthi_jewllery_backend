// models/ScheduledNotification.js
import mongoose from 'mongoose';

const ScheduledNotificationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 'send notification'
  data: {
    type: {
      type: String, enum: ['sms'], required: true
    },
    payload: {
      mobile: { type: String, required: true },
      message: { type: String, required: true },
      messageType: { type: String, enum: ['birthday', 'wedding', 'otp', 'notification', 'promotion'], required: true }
    }
  },
  priority: { type: Number, default: 0 },
  shouldSaveResult: { type: Boolean, default: false },
  type: { type: String, default: 'sms' }, // 'normal' is Agenda default
  nextRunAt: { type: Date },       // when it's scheduled
  lastModifiedBy: { type: mongoose.Schema.Types.Mixed, default: null },
  lockedAt: { type: Date },        // if Agenda is currently processing it
  lastRunAt: { type: Date },       // when it last ran (optional)
  lastFinishedAt: { type: Date },  // when it last finished (optional)
  failedAt: { type: Date },        // if failed
  failReason: { type: String },    // if failed
  repeatInterval: { type: String },// for recurring jobs
  repeatTimezone: { type: String },// timezone of the repeat
  createdAt: { type: Date, default: Date.now },
});

const ScheduledNotification = mongoose.model('scheduled_notifications', ScheduledNotificationSchema);

export default ScheduledNotification;