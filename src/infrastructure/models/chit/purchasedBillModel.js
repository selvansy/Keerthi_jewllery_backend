import mongoose from 'mongoose';

const purchasedbillSchema= new mongoose.Schema({
    id_purchase_account:{type:mongoose.Schema.Types.ObjectId,ref:'purchase_account'},
    bill_no:{type:String,required:true},
    bill_date:{type:String,required:true},
    id_branch:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Branch'},
    status:{type:Number,required:true},
    active:{type:Number,required:true,default:1},
    closed_by:{type:Number,required:true}
},{
    timestamps:true
});

export default mongoose.model('PurchasedBill',purchasedbillSchema);