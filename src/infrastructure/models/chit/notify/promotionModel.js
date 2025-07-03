
import mongoose from "mongoose";

// const PromotionSchema = new mongoose.Schema({
//   title: String,
//   body: String,
//   isHtml: { type: Boolean, default: false },
//   image: String,
//   // imageUrl: String,
//   sms: { type: Boolean, default: false },
//   email: { type: Boolean, default: false },
//   whatsapp: { type: Boolean, default: false },
//   pushNotification: { type: Boolean, default: false },
//   campaignTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "CampaignType" },
//   // targetAudience: { type: mongoose.Schema.Types.ObjectId, ref: "TargetAudience" },
//   // fcmTokenList: [String], // Array of FCM tokens
//    branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }], // Branch-based targeting
//      schemeId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scheme" }], 
//      customerId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],
//   //  productId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Product-based targeting
//   //newArraivalId: { type: mongoose.Schema.Types.ObjectId, ref: "NewArrivals" }, // New arrivals 
//   scheduledAt: Date,
//   sentAt: Date,
//   is_auto: {type: Boolean, default: false},
//   status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
//   updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

//     // todo need to check
//     pushCount: {type: Number, default: 0},
//     smsCount: {type: Number, default: 0},
//     whatsappCount: {type: Number, default: 0},
//     emailCount: {type: Number, default: 0},
    
//     pushFailCount: {type: Number, default: 0},
//     smsFailCount: {type: Number, default: 0},
//     whatsappFailCount: {type: Number, default: 0},
//     emailFailCount: {type: Number, default: 0},
    
//     active: {default: true, type: Boolean},


// }, { timestamps: true });
// // PromotionSchema.index({ campaignTypeId: 1, branchId: 1, productId: 1, categoryId: 1 });
// // PromotionSchema.index({ branchId: 1 });
// // PromotionSchema.index({ schemeId: 1 });
// // PromotionSchema.index({ productId: 1 });


const PromotionSchema = new mongoose.Schema({
  title: String,
  body: String,
  isHtml: { type: Boolean, default: false },
  image: String,
  sms: { type: Boolean, default: false },
  email: { type: Boolean, default: false },
  whatsapp: { type: Boolean, default: false },
  pushNotification: { type: Boolean, default: false },
  campaignTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "CampaignType" },
  branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
  schemeId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scheme" }],
  scheduledAt: Date,
  sentAt: Date,
  is_auto: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  active: { default: true, type: Boolean },
}, { timestamps: true });

export default mongoose.model("Promotion", PromotionSchema);