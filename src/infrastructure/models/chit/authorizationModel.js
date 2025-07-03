import mongoose from 'mongoose';

const authorizationSchema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true
    },
    id_customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Customer'
    },
    id_employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Employee'
    },
    acive: {
        type: Number,
        required: true
    },
    login_time: {
        type: String,
        required: true
    },
    logout_time: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Authorization', authorizationSchema);