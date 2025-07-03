import mongoose from 'mongoose';

const purchaseAccountSchema = new mongoose.Schema({
    id_product: { type: mongoose.Schema.Types.ObjectId,ref:'Product'},
    id_customer: { type: mongoose.Schema.Types.ObjectId,ref:'Customer'},
    id_branch: { type: mongoose.Schema.Types.ObjectId, required: true,ref:'Branch'},
    paymentcode: { type: String, required: true },
    transactionid: { type: String, required: true },
    purchase_amount: { type: Number, required: true },
    qty: { type: Number, required: true },
    weight: { type: Number, required: true }, 
    purity: { type: Number, required: true },
    current_rate: { type: Number, required: true }, 
    id_metal: { type: mongoose.Schema.Types.ObjectId, required: true,ref:'Metal'},
    price: { type: Number, required: true }, 
    purchase_date: { type: String, required: true },
    bill_no: { type: String, required: true },
    bill_date: { type: String, required: true }, 
    payment_status: { type: Number, required: true },
    active: { type: Boolean, default: false },
    date_add: { type: Date, required: true },
    date_upd: { type: Date, required: true },
    added_by: { type: mongoose.Schema.Types.ObjectId, required: true,ref:''},
    status: { type: Number, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true,ref:''}
  }, {
    timestamps: true
  });

  export default mongoose.model('PurchaseAccount',purchaseAccountSchema);