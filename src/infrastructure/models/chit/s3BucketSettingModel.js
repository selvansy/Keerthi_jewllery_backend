import mongoose from 'mongoose';

const s3bucketsettingSchema = new mongoose.Schema({
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

  s3key: { //  
    type: String, 
    required: true
  },
  s3secret: { // 1- ON 2-OFF
    type: String, 
    required: true
  },
  s3bucket_name: { // 
    type: String, 
    required: true,
    default:""
  }, 
  s3display_url: { // 
    type: String, 
    required: true,
    default:""
  },  
  region: { // 
    type: String, 
    required: true,
    default:""
  }, 
 
}, { timestamps: true });


export default mongoose.model('S3BucketSetting', s3bucketsettingSchema);