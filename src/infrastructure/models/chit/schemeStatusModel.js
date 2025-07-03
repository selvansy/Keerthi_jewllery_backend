
import mongoose from 'mongoose';
import counterModel from './CounterModel.js';  

const schemestatusSchema = new mongoose.Schema({
    id_status: {
        type: Number,
        required: true,
        default: 1
    },
    status_name: { 
      type: String, 
      default: null 
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    active:{
        type:Boolean,
        default:true
    }
    
}, {
    timestamps: true
});


schemestatusSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
        
            const counter = await counterModel.findByIdAndUpdate(
                { _id: 'id_status' },
                { $inc: { seq: 1 } }, 
                { new: true, upsert: true }
            );

            this.id_status = counter.seq;

            next();
        } catch (error) {
            next(error); 
        }
    } else {
        next();
    }
});

export default mongoose.model('SchemeStatus', schemestatusSchema);