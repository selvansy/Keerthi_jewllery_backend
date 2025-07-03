import mongoose from 'mongoose';

const smssettingSchema = new mongoose.Schema({
  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
     ref:"Branch"
  },
  id_project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Project"
  },
  id_client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Client"
  },
 
  sms_access: { // 1- Both 2- App SMS 3- Admin SMS
    type: Number,
    required: true,
    default: 1
  },
  otp_sent: { // 1- ON 2- OFF
    type: Number,
    required: true,
    default: 1
  },
  otp_content: {
    type: String,
    required: false,
    default:""
  },
  customer_sent: { // 1- ON 2- OFF
    type: Number,
    required: true,
    default: 1
  },
  customer_content: { 
    type: String,
    required: false,
    default:""
  },
  schemeaccount_sent: { // 1- ON 2- OFF
    type: Number,
    required: true,
    default: 1
  },
  schemeaccount_content: { 
    type: String,
    required: false,
    default:""
  },
  payment_sent: { // 1- ON 2- OFF
    type: Number,
    required: true,
    default: 1
  },
  payment_content: {
    type: String,
    required: false,
    default:""
  },
  otp_url: { 
    type: String,
    required: false,
    default:""
  },
  customer_url: { 
    type: String,
    required: false,
    default:""
  },
  schemeaccount_url: { 
    type: String,
    required: false,
    default:""
  },
  payment_url: { 
    type: String,
    required: false,
    default:""
  },
}, { timestamps: true });


export default mongoose.model('SmsSetting', smssettingSchema);