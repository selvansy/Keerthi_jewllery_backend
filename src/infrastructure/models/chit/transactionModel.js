import mongoose,{ Schema } from 'mongoose';

const transactionSchema = new Schema({
  transdetailid: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'TransactionDetails',
    required: true
  },
  transactionid: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    default: 0      // 0- web admin, 1- android, 2- ios
  },
  payment_code: {
    type: String
  },
  id_customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Customer"
  },
  id_scheme_account: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"SchemeAccount"
  },
  id_scheme: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Scheme"
  },
  mobile: {
    type: String,
    default: null
  },
  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    default:null,
    ref:"Branch"
  },
  payment_date: {
    type: Date,
    default: null
  },
  trasfer_date: {
    type: Date
  },
  paid_installments: {
    type: Number,
    required: true
  },
  payment_amount: {
    type: Number, 
    default: null
  },
  // scheme_total: {
  //  type: Number,
  //   required: true
  // },
  metal_weight: {
   type: Number,
    default: null
  },
  metal_rate: {
   type: Number,
    default: null
  },
  payment_mode: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  payment_status: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7], //1-success,2-awaiting,3-failed,4-cancelled,5-Returned,6-Refund,7-Pending
    default: null
  },
  payment_type: {
    type: Number,
    enum: [1, 2], // 1-Offline, 2-Online
    default: 1
  },
  date_add: {
    type: Date,
    required: true,
    default: Date.now
  },
  date_upd: {
    type: Date,
    default: null
  },
  active: {
    type:Boolean,
    default:true
  },
  is_deleted:{
    type:Boolean,
    default:false
  }
},{
  timestamps:true
});

export default mongoose.model('Transaction',transactionSchema)