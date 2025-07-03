import mongoose from 'mongoose';

const appsettingSchema = new mongoose.Schema({
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
  android_version: { 
    type: String,
    required: true
  },
  ios_version: {
    type: String,
    required: true
  },
  is_android_latest: { // true-Updated false- Not-updated
    type: Boolean,
    required: true,
    default: true
  },
  is_ios_latest: {  // true-Updated false- Not-updated
    type: Boolean,
    required: true,
    default: true
  },
  android_link: { 
    type: String,
    required: false,
    default:""
  }, 
  ios_link: {
    type: String,
    required: false,
    default:""
  },
  youtube_link: {
    type: String,
    required: false,
    default:""
  }, 
  facebook_link: {
    type: String,
    required: false,
    default:""
  }, 
  instagram_link: {
    type: String,
    required: false,
    default:""
  }, 
  website_link: { 
    type: String,
    required: false,
    default:""
  },
  social_link: {
    type: String,
    required: false,
    default:""
  },
  android_launch: {
    type: Date,
    required: false,
    default:""
  },
  ios_launch: {
    type: Date,
    required: false,
    default:""
  },
  is_deleted:{
    type:Boolean,
    default:false
  },
  active:{
    type:Boolean,
    default:true
  }
 
}, { timestamps: true });


export default mongoose.model('AppSetting', appsettingSchema);