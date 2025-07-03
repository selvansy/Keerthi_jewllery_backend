import mongoose from "mongoose";

const PushNotificationSchema = new mongoose.Schema({
  title: String,
  body: String,
  // isHtml: { type: Boolean, default: false },
  image: String,
  imageUrl: String,
  campaignTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "CampaignType" },
  // targetAudience: { type: mongoose.Schema.Types.ObjectId, ref: "TargetAudience" },
  // fcmTokenList: [String], // Array of FCM tokens
  branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }], // Branch-based targeting
  schemeId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scheme" }], // Scheme
  // productId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Product-based targeting
  newArraivalId: { type: mongoose.Schema.Types.ObjectId, ref: "NewArrivals" }, // New arrivals 
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  scheduledAt: Date,
  sentAt: Date,
  is_auto: {type: Boolean, default: false},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

  pushCount: {type: Number, default: 0},
  pushFailCount: {type: Number, default: 0},
  active: {default: true, type: Boolean},


}, { timestamps: true });

PushNotificationSchema.index({ campaignTypeId: 1, branchId: 1, productId: 1, categoryId: 1 });

export default mongoose.model("PushNotification", PushNotificationSchema);


// import mongoose from "mongoose";

// const pushnotificationSchema= new mongoose.Schema({
//     noti_name:{
//         type:String,
//         required:true
//     },
//     noti_desc:{
//         type:String,
//         required:true
//     },
//     noti_image:{
//         type:String,
//         required:true
//     },
//     senttype:{
//         type:Number,
//         required:true
//     },
//     total_sent:{
//         type:Number,
//         required:false,
//         deafult:0
//     },
//     active:{
//         type:Boolean,
//         default:true
//     },
//     is_deleted:{
//         type:Boolean,
//         default:false
//     },
//      id_branch: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref:"Branch"
//     },
//     total_sent:{
//         type:Number,
//         default:0
//       }
// },{
//     timestamps:true
// });

// export default mongoose.model('Pushnotification',pushnotificationSchema);