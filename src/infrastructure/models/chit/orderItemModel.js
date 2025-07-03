import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id_orderitem: { type: mongoose.Schema.Types.ObjectId, auto: true },
  id_order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  id_branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  id_customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  productname: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  purity: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  qty: { type: Number, required: true },
  proimage: { type: String, required: true },
  metal_rate: { type: Number, required: true },
  status: { type: Number, enum: [1, 2, 3, 4], required: true, default: 1 },
  active: { type: Boolean, default: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export default OrderItem;