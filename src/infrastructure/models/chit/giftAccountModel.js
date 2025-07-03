import mongoose from 'mongoose';

const giftaccountSchema= new mongoose.Schema({
    issue_type:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:''
    },
    id_branch:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Branch'
    },
    id_giftinward:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"giftinwards"
    },
    id_gift:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Giftitem'
    },
    barcode:{
        type:String,
        required:true
    },
    qty:{
        type:Number,
        required:true
    },
    id_scheme_account:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'SchemeAccount'
    },
    id_customer:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Customer'
    },
    active:{
        type:Number,
        required:true,
        default:1
    },
    create_date:{
        type:Date,
        default:Date.now(),
        required:true
    }
},{
    timestamps:true
});

export default mongoose.model('Giftaccount',giftaccountSchema)