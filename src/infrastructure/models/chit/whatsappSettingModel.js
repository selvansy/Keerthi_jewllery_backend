import mongoose from 'mongoose';

const whatsappsettingSchema = new mongoose.Schema({
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
    ref:"Client"
  },
  whatsapp_access: { 
    type: Number,
    default:1   // 1-Both 2-App message 3-admin message
  },
  whatsapp_type: {   // 1-Utility Message 2-marketing Message
    type: Number,
    default:1
  },
   newarrival_sent: { // 1- ON 2-OFF
    type: Number, 
    default:2  //true- on , false- off
  },
  newarrival_key: { // 
    type: String, 
    default:""
  },
  product_sent: { // 1- ON 2-OFF
    type: Number, 
    default:2    // true- on , false- off
  },
  product_key: { 
    type: String, 
    default:""
  },
  offers_sent: {    // 1- ON 2-OFF
    type: Number,  
    default:2   // true- on , false- off
  },
  offers_key: { // 
    type: String, 
    default:""
  },
  wedding_sent: { // 1- ON 2-OFF
    type: Number, 
    default:2
  },
  wedding_key: { // 
    type: String, 
    default:""
  },
  birthday_sent: {     //pre // 1- ON 2-OFF
    type: Number, 
    default: 2 // true - on , false - off
  },
  birthday_key: {
    type: String,
    default:""
  },
  payment_sent:{
    type:Number,
    default:0
  },
  payment_key:{
    type:String,
    defualt:''
  }
 
}, { timestamps: true });


export default mongoose.model('WhatsappSetting', whatsappsettingSchema);