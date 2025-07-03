import mongoose from 'mongoose';

const layoutsettingSchema = new mongoose.Schema({
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
 
  layout_color: {
    type: String,
    required: true
  }, 

  layout_type: { // 1-right 2-top
    type: Number, 
    required: true,
    default:1
  },
  branch_logo: {  
    type: String, 
    required: true
  },
  branch_favicon: { 
    type: String, 
    required: true,
    default:""
  }, 
  branch_image: { 
    type: String, 
    required: true,
    default:""
  }, 
 
}, { timestamps: true });


export default mongoose.model('Layoutsetting', layoutsettingSchema);