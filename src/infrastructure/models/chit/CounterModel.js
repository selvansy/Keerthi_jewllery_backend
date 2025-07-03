import mongoose from 'mongoose';


const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
  barcode:{type:Number}
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;