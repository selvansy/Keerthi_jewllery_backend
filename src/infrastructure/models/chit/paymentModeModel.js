import mongoose from 'mongoose';

const paymentModeSchema = new mongoose.Schema({
    id_project: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Project is required'],
        ref: "Project"
    },
    id_mode:{
        type:Number,
    },
    mode_name: { 
        type: String,
        required: true,
        trim: true,
        minlength: 2, 
        maxlength: 50 
    },
    payment_method_type: {    // Old: typeway
        type: String,
        required: true,
        enum: ['Offline', 'Online']
    },
    active: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('PaymentMode', paymentModeSchema);