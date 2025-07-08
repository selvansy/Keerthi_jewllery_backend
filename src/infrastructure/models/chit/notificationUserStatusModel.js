import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        // enum: ['promotion', 'offer', 'alert', 'update', 'reminder', 'general'],
        default: 'general'
    },
    category: {
        type: String,
        // enum: ['Gold Rate', 'special_offer', 'festival_offer', 'general',"Payment","Scheme account","Scheme","Wallet"],
        default: 'general'
    },
    action: {
        type: String,
        enum: ['navigate', 'external_link', 'popup', 'none'],
        default: 'none'
    },
    image:{
        type:String,
        default:""
    },
    action_target: String,
    sent_time: {
        type: Date,
        default: Date.now,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

const notificationUserStatusSchema = new mongoose.Schema({
    notification_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    status: {
        type: Number,
        enum: [0, 1, 2, 3], // 0=sent, 1= cleared,2=read, 3=clicked
        default: 0
    },
    status_changes: [{
        status: Number,
        changed_at: Date
    }],
    device_platform: String
}, {
    timestamps: true
});

notificationSchema.index({ sent_time: -1 });
notificationSchema.index({ type: 1, sent_time: -1 });

notificationUserStatusSchema.index({ 
    user_id: 1, 
    'status_changes.changed_at': -1 
});
notificationUserStatusSchema.index({
    notification_id: 1,
    status: 1
});

const Notification = mongoose.model('Notification', notificationSchema);
const NotificationUserStatus = mongoose.model('NotificationUserStatus', notificationUserStatusSchema);

export { Notification, NotificationUserStatus };