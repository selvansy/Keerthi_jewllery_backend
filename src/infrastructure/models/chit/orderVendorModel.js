import mongoose from 'mongoose';

const ordervendorSchema = new mongoose.Schema({
  order_vendorid: { type: mongoose.Schema.Types.ObjectId, auto: true },
  vendor_name: { type: String, required: true },
  address: { type: String, required: true },
  mobile: { type: String, required: true },
  gst: { type: String, required: true },
  id_branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  active: { type: Boolean, default: true },
  is_deleted:{type:Boolean,defautl:false},
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  createdate: { type: Date, default: Date.now },
  modify_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  modifydate: { type: Date },
});

const OrderVendor = mongoose.model('OrderVendor', ordervendorSchema);

export default OrderVendor;