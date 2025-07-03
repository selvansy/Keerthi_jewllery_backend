import mongoose from 'mongoose';

const notificationsettingSchema = new mongoose.Schema({
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
 
  notifyappid: { 
    type: String,
    required: true
  },
  notifyauthirization: {
    type: String,
    required: true
  },

  notify_sent: { // 1- ON 2-OFF
    type: Number, 
    required: true
  },
  newarrival_sent: { // 1- ON 2-OFF
    type: Number, 
    required: true 
  },
  product_sent: { // 1- ON 2-OFF
    type: Number, 
    required: true
  },
  offers_sent: { // 1- ON 2-OFF
    type: Number, 
    required: true
  },
 
}, { timestamps: true });


export default mongoose.model('Notificationsetting', notificationsettingSchema);