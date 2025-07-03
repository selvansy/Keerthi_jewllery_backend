import mongoose from 'mongoose';

const designationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 80,
  },
  active: {
    type: Number,
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'Employee'
  },
}, {
  timestamps: true,
});

export default mongoose.model('Designation', designationSchema);