
import mongoose from 'mongoose';
import counterModel from './CounterModel.js';

const installmenttypeSchema = new mongoose.Schema({
    installment_type: {
        type: Number,
        required: true,
        default: 0
    },
    installment_name: { 
      type: String, 
      default: null 
    },
    active: {
        type: Number,
        default: 1 //1-active, 0-inactive
    },
    sortOrder: { 
        type: Number
      },
}, {
    timestamps: true
});


installmenttypeSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
        
            const counter = await counterModel.findByIdAndUpdate(
                { _id: 'installment_type' },  // You can change 'installment_type' to another string if you need a more specific counter
                { $inc: { seq: 1 } },  // Increment the seq field by 1
                { new: true, upsert: true } // Create the counter if it doesn't exist
            );

            // Set the installment_type to the new incremented value
            this.installment_type = counter.seq;

            next();  // Continue with the save operation
        } catch (error) {
            next(error);  // Pass the error to the next middleware
        }
    } else {
        next();  // Skip if not a new document
    }
});

export default mongoose.model('InstallmentType', installmenttypeSchema);