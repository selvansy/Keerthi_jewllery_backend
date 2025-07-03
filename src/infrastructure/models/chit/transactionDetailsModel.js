import mongoose, { mongo, Schema } from 'mongoose';

const transactiondetailsSchema = new mongoose.Schema({
    transactionid: {
        type: String,
        required: true
    },
    platform:{
        type:String,
        required:true  // web, ios, android
    },
    payment_code:{
        type:String
    },
    id_customer:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Customer"
    },
    mobile:{
        type:String,
        required:true
    },
    id_branch:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    total_account:{
        type:Number,
        required:true
    },
    total_amount:{
        type:Number,
        required:true
    },
    payment_type:{
        type:Number,
        required:true,
        enum:[1,2]      // 1-Offline ,2- online
    },
    payment_status:{
        type:Number,
        required:true  // 1- pending 2- success
    },
    payment_mode:{
        type:String,
        required:false
    },
    cash_amount:{
        type:Number
    },
    card_amount:{
        type:Number
    },
    gpay_amount:{
        type:Schema.Types.Decimal128
    },
    trans_date:{
        type:Date,
        default:Date.now(),
        required:true
    },
    active: {
        type: Boolean,
        default: true // 1-active, 2-inacive
    },
    is_deleted:{
        type:Boolean,
        default:false,
    }
}, {
    timestamps: true
});

export default mongoose.model('TransactionDetails',transactiondetailsSchema);