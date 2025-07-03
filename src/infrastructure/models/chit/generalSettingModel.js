import mongoose from 'mongoose';

const generalsettingSchema = new mongoose.Schema({
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
  print_type: {
    type: Number,
    required: true
},
account_number: {
    type: Number,
    required: true
},
scheme_amount: {
    type: Number,
    required: true
},
display_receiptno: {
    type: Number,
    required: true
},
display_agent: {
    type: Number,
    required: true
},
close_print: {
    type: Number,
    required: true
},
collection_percentage: {
    type: Number,
    required: true
},
referral_calc: {
    type: Number,
    required: true
}
}, { timestamps: true });


export default mongoose.model('Generalsetting', generalsettingSchema);