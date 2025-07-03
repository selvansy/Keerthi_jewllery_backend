import mongoose from 'mongoose';

const TopupSchema = new mongoose.Schema({
    id_client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Client",
    },
    SMS: {type:Number,default:0},
    WhatsApp: { type: Number, default: 0 },
    Email: { type: Number, default: 0 },
    status: { type: Number, enum: [0, 1], default: 0 }, // 0 - Requested, 1 - Approved
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    modified_by: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    },
    active: { type: Boolean, default: true }, 
    remarks: { type: String,default:""}

}, { timestamps: true });

export default mongoose.model("topup", TopupSchema);
