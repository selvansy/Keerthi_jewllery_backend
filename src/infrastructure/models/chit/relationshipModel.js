import mongoose from 'mongoose';
import counterModel from './CounterModel.js';

const relationshipSchema = new mongoose.Schema(
  {
    id_relationship: {
      type: Number,
      required: true,
      default: 1,
    },
    relationship: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default:true, 
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps: true,
  }
);

relationshipSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await counterModel.findByIdAndUpdate(
        { _id: 'relationship' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.id_relationship = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Relationship', relationshipSchema);