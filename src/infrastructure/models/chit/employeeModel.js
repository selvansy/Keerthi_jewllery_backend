import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
  resume: {
    type: String,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Please enter a valid mobile number'],
  },
  pan: { 
    type: String,
    required: false,
    default: null,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Please fill a valid PAN number']
  },  
  phone: {
    type: String,
    required: false
  },
  whatsappNumber: {
    type: String,
    // required: true,
    // unique: true,
    match: [/^\d{10}$/, 'Please enter a valid mobile number'],
  },
  address: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
   id_city: {
     type:mongoose.Schema.Types.ObjectId,
     required: true,
     ref:"City"
   },
   id_state:{
     type:mongoose.Schema.Types.ObjectId,
     required:true,
     ref:"State"
   },
   id_country: {
     type:mongoose.Schema.Types.ObjectId,
     required: true,
     ref:"Country"
   },
  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref:"Branch"
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  emp_code: {
    type: String
  },
  date_of_join: {
    type: Date,
    required: true,
  },
  gender: {
    type: Number,
    required: true,
  },
  image: {
    type: String
  },
  active: {
    type: Boolean,
    default:true
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
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Employee"
  },
  modified_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Employee"
  },
  aadharNumber:{
    type:Number
  },
  referral_code:{
    type:String,
    required:true
  },
  employeeIncentivePercentage:{
    type:Number,
    default:0
  },
  employeeId:{
    type:String,
    default:null
  },
  department:{
    type:mongoose.Schema.Types.ObjectId,
    requrired:true,
    ref:"Department"
  }
},{
  timestamps:true
});

export default mongoose.model('Employee', employeeSchema);