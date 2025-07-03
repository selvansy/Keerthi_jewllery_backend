import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  company_name: {
    type: String,
    default: null
  },
  short_code: {
    type: String,
    required: true
  },
  address1: {
    type: String,
    default: null
  },
  address2: {
    type: String,
    default: null
  },
  id_country: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  id_state: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  id_city: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  pincode: {
    type: String,
    default: null
  },
  mobile: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  payment_mail: {
    type: String,
    required: true
  },
  notifyappid: {
    type: String,
    required: true
  },
  notifyauthirization: {
    type: String,
    required: true
  },
  notify_sent: {
    type: Number,
    required: true,
    enum: [0, 1]  // 0 - Notify not sent, 1 - Notify sent
  },
  website: {
    type: String,
    default: null
  },
  mobile_app_link: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  show_download: {
    type: Number,
    required: true
  },
  digi_gold: {
    type: Number,
    required: true,
    default: 2
  },
  smalllogo: {
    type: String,
    required: true
  },
  favicon: {
    type: String,
    required: true
  },
  date_add: {
    type: Date,
    default: null
  },
  date_upd: {
    type: Date,
    default: null
  },
  whatsapp_no: {
    type: String,
    default: null
  },
  print_type: {
    type: Number,
    required: true
  },
  accesskey: {
    type: String,
    required: true
  },
  whatsapp_access: {
    type: Number,
    required: true
  },
  whatsapp_key: {
    type: String,
    required: true
  },
  whatsapp_url: {
    type: String,
    required: true
  },
  whatsapp_sent: {
    type: Number,
    required: true
  },
  smsusername: {
    type: String,
    required: true
  },
  smspassword: {
    type: String,
    required: true
  },
  sms_sent: {
    type: Number,
    required: true,
    enum: [0, 1] // 0 - SMS not sent, 1 - SMS sent
  },
  sms_access: {
    type: Number,
    required: true,
    default: 1
  },
  payment_type: {
    type: String,
    required: true
  },
  merchant_id: {
    type: String,
    required: true
  },
  merchant_key: {
    type: String,
    required: true
  },
  secret_key: {
    type: String,
    required: true
  },
  s3key: {
    type: String,
    required: true
  },
  s3secret: {
    type: String,
    required: true
  },
  s3url: {
    type: String,
    required: true
  },
  s3display_url: {
    type: String,
    required: true
  },
  s3upload_url: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  mail_username: {
    type: String,
    required: true
  },
  mail_password: {
    type: String,
    required: true
  },
  mail_sent: {
    type: Number,
    required: true,
    enum: [0, 1] // 0 - Mail not sent, 1 - Mail sent
  },
  tollfree1: {
    type: String,
    default: null
  },
  active: {
    type: Number,
    required: true
  },
  bgcolor: {
    type: String,
    required: true
  },
  bgimage: {
    type: String,
    required: true
  },
  loginlogo: {
    type: String,
    required: true
  },
  logobtm: {
    type: String,
    required: true
  },
  primarycolor: {
    type: String,
    required: true
  },
  secondarycolor: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  account_number: {
    type: Number,
    required: true,
    default: 1
  },
  purity: {
    type: Number,
    required: true,
    default: 2
  },
  gstno: {
    type: String,
    required: true
  },
  close_print: {
    type: Number,
    required: true,
    default: 1
  },
  display_weight: {
    type: Number,
    required: true
  },
  display_agent: {
    type: Number,
    required: true,
    default: 2
  },
  collection_percentage: {
    type: Number,
    required: true
  },
  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: 1
  },
  scheme_amount: {
    type: Number,
    required: true,
    default: 1 // 1-Dropdown, 2-Text
  },
  customer_integerate: {
    type: Number,
    required: true,
    default: 1 // 1-non integrate, 2-integrate
  },
  display_receiptno: {
    type: Number,
    required: true,
    default: 2
  },
  denominationtype: {
    type: Number,
    required: true,
    default: 2
  },
  referral_calc: {
    type: Number,
    default: 1
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, { timestamps: true });


export default mongoose.model('Company', companySchema);