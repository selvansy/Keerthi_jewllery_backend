import mongoose from 'mongoose';


const TopupHistorySchema = new mongoose.Schema({
    id_client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Client",
    },
    SMS: { type: Boolean, default: false },
    WhatsApp: { type: Boolean, default: false },
    Email: { type: Boolean, default: false },

    limitRequest: { type: Number, required: true },
    limitRate: { type: Number, required: true },
    requestedDate: { type: Date, default: Date.now },
    requestedAmount: { type: Number, required: true },
    actualAmount: { type: Number },
    approvalDate: { type: Date },
    status: { type: Number, enum: [0, 1], default: 0 }, // 0 - Requested, 1 - Approved
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    modified_by: {
        type: mongoose.Schema.Types.ObjectId, 
        
    },
    active: { type: Boolean, default: true }, 
    remarks: { type: String,default:""},
    availableCredit: { type: Number, default:0 },

}, { timestamps: true });

export default mongoose.model("topupHistory", TopupHistorySchema);
