import mongoose from 'mongoose';

const gatwaysettingSchema = new mongoose.Schema({
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
 
  payment_type: { // 1-Easebuzz 2-Cashfree
    type: Number,
    required: true,
    default:2
  }, 

  payment_email: { // 
    type: String, 
    required: true
  },
  merchant_key: { // 1- ON 2-OFF
    type: String, 
    required: true
  },
  secret_key: { // 
    type: String, 
    required: true,
    default:""
  }, 
 
}, { timestamps: true });


export default mongoose.model('Gatwaysetting', gatwaysettingSchema);