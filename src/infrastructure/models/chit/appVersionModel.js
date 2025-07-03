import mongoose from "mongoose";

const AppUpdateSettingSchema = new mongoose.Schema({
  androidVersion: {
    type: String,
    required: true
  },
  iosVersion: {
    type: String,
    required: true
  },
  showUpdateForAndroid: {
    type: Boolean,
    default: false
  },
  showUpdateForIos: {
    type: Boolean,
    default: false
  },
  androidUrl: {
    type: String,
    required: true
  },
  iosUrl: {
    type: String,
    required: true
  },
  updatedBy:{
   type:String,
   default:"admin"
  }
}, {
  timestamps: true
});

export default mongoose.model('AppUpdateSetting', AppUpdateSettingSchema);