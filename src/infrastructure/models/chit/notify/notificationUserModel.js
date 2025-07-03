import mongoose from 'mongoose';

const notificationUserSchema = new mongoose.Schema({
    id_customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref:'Customer'
    },
    subscription_id: { 
        type: String, 
        default: null 
    },
    app_id: { 
        type: String, 
        default: null 
    },
    active: { 
        type: Number, 
        required: true 
    },
    numberof_sent: { 
        type: Number, 
        required: true 
    },
    createdate: { 
        type: String, 
        required: true 
    },  
    updatedate: { 
        type: String, 
        required: true 
    }
  }, {
    timestamps: false
  });

  export default mongoose.model('NotificationUser',notificationUserSchema);