import mongoose from 'mongoose';

// Sub-schema for notification settings
const NotificationSettingsSchema = new mongoose.Schema({
  schemeWise: {
    paymentProceed: { type: Boolean, default: false },
    schemeJoining: { type: Boolean, default: false },
    schemeCompletion: { type: Boolean, default: false },
    schemeClose: { type: Boolean, default: false },
    schemeReferral: { type: Boolean, default: false },
    walletAmountRedeem: { type: Boolean, default: false },
    overdue: { type: Boolean, default: false }
  },
  wishes: {
    birthday: { type: Boolean, default: false },
    weddingAnniversary: { type: Boolean, default: false }
  },
  product: {
    newArrival: { type: Boolean, default: false }
  }
});

// Main schema with embedded settings
const NotificationConfigSchema = new mongoose.Schema({
  pushNotification: {
    enabled: { type: Boolean, default: false },
    settings: { type: NotificationSettingsSchema, default: () => ({}) }
  },
  sms: {
    enabled: { type: Boolean, default: false },
    settings: { type: NotificationSettingsSchema, default: () => ({}) }
  },
  whatsapp: {
    enabled: { type: Boolean, default: false },
    settings: { type: NotificationSettingsSchema, default: () => ({}) }
  },
  email: {
    enabled: { type: Boolean, default: false },
    settings: { type: NotificationSettingsSchema, default: () => ({}) }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('NotificationConfig',NotificationConfigSchema);
