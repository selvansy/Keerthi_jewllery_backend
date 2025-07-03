import mongoose, { Schema } from 'mongoose';

const transactionpurchaseSchema=  new mongoose.Schema({
    transactionid: {
        type: String,
        required: true
      },
      typeofway: {
        type: String,
        required: true
      },
      payment_code: {
        type: String,
        required: true
      },
      id_customer: {
        type: Schema.Types.ObjectId, // references a customer model
        required: true,
        ref: 'Customer'
      },
      id_product: {
        type: Schema.Types.ObjectId, // references a product model
        required: true,
        ref: 'Product'
      },
      qty: {
        type: Number,
        required: true
      },
      id_metal: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Metal"
      },
      weight: {
        type: Number,
        required: true
      },
      purity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      mobile: {
        type: String,
        required: true
      },
      id_branch: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Branch'
      },
      total_account: {
        type: Number,
        required: true
      },
      total_amount: {
        type: Schema.Types.Decimal128,
        required: true
      },
      payment_type: {
        type: Number,
        required: true,
        enum: [1, 2] // 1 - Offline, 2 - Online
      },
      payment_status: {
        type: Number,
        required: true
      },
      payment_mode: {
        type: Number,
        required: true
      },
      trans_date: {
        type: String,
        required: true
      },
      active: {
        type: Number,
        required: true,
        default: 1,
        enum: [1, 2] // 1 - active, 2 - delete
      }
},{
    timestamps:true
});

export default mongoose.model('TransactionPurchase',transactionpurchaseSchema);