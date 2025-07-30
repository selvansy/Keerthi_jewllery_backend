import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: false,
    default:null
  },
  lastname: {
    type: String,
    default:"",
    required: false,
  },
  mobile: {
    type: Number,
    required: false,
    match: [/^\d{10}$/, 'Please enter a valid mobile number'],
    default:null
  },
  address: {
    type: String,
    required: false,
    default:null
  },
  pincode: {
    type: Number,
    required: false,
    default:null
  },
  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref:'Branch',
    default:null

  },
  id_city: {
    type:mongoose.Schema.Types.ObjectId,
    required: false,
    ref:"City",
    default:null
  },
  id_state:{
    type:mongoose.Schema.Types.ObjectId,
    required:false,
    ref:"State",
    default:null
  },
  id_country: {
    type:mongoose.Schema.Types.ObjectId,
    required: false,
    ref:"Country",
    default:null
  },
  date_of_birth: {
    type: Date,
    default:null
  },
  date_of_wed: {
    type: Date,
    default:null
  },
  gender: { 
    type: Number
  },
  whatsapp: {
    type: String,
    required: false,
    default:null
  },
  phone: {
    type: String,
    required: false,
    default:null
  },
  email: {
    type: String,
    required: false,
    default:null
  },
  cus_img: {
    type: String,
    required: false,
    default:null
  },
  pan: { 
    type: String,
    default:null
  },
  aadharNumber: {
    type: String,
    default:null
  },
  username: {
    type: String,
    required: false,
    default:null
  },
  password: {
    type: String,
    required: false,
    default:null
  },
  mpin: {
    type: String,
    required: false,
    default:null
  },
  active: {
    type: Boolean,
    default: true
  },
  is_deleted:{
    type:Boolean,
    default:false
  },
  date_add: {
    type: Date,
    default: Date.now,
  },
  date_upd: {
    type: Date,
    default: Date.now,
  },
  added_by: {
    type: Number,
    enum: [0, 1, 2],
    default:0
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Employee',
  },
  referral_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    required: false,
  },
  referral_type: {
    type: String,
    enum: ["Employee", "Customer","Agent",""],
    default:"",
    required: false,
  },
  referral_code: {
    type: String,
    required: false,
    default: 0,
  },
  otpVerified:{
    type:Boolean,
    default:false
  },
},{
  timestamps:true
});


// 💡 Place this right after your `customerSchema` definition
customerSchema.pre('save', function (next) {
  if (!this.cus_img) {
    switch (this.gender) {
      case 2: // female
        this.cus_img = '1749878753243.webp';
        break;
      case 3: // others / non‑binary
        this.cus_img = '1749878926644.webp';
        break;
      case 1: // male
      default: // anything missing / invalid → treat as male
        this.cus_img = '1749878256269.webp';
        break;
    }
  }
  next();
});


export default mongoose.model('Customer', customerSchema);