import mongoose, { Schema } from 'mongoose';

const WhatsappMessage = new mongoose.Schema({
    id_product: {
        type: mongoose.Schema.Types.ObjectId, // 3
        ref:"Product"
    },
    id_offers: {
        type: mongoose.Schema.Types.ObjectId, //1
        ref:"Offer"
    },
    id_newarrival: {
        type: mongoose.Schema.Types.ObjectId, // 2
        ref:"NewArrivals"
    },
    id_branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Branch"
    },
    senttype:{
        type:Number,
        default:0
    },
    acitve:{
        type:Boolean,
        default:true
    },
    is_delete:{
        type:Boolean,
        default:false,
    }
}, {
    timestamps: true
});

export default mongoose.model('WhasppMessage',WhatsappMessage);