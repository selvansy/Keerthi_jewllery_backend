import mongoose from 'mongoose';
import counterModel from './CounterModel.js';

const schemeTypeSchema = new mongoose.Schema({
    scheme_type: { 
        type: Number,
        unique: true
    },
    scheme_typename: { 
        type: String, 
        default: null 
    },
    active: { 
        type: Boolean, 
        default:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
}, { 
    timestamps: true 
});

schemeTypeSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            const counter = await counterModel.findOneAndUpdate(
                { _id: 'scheme_type' },
                { $inc: { seq: 1 } },
                { 
                    new: true,       
                    upsert: true,    
                    setDefaultsOnInsert: true
                }
            );
            
            this.scheme_type = counter.seq;
        }
        next();
    } catch (error) {
        next(error);
    }
});

schemeTypeSchema.statics.initCounter = async function() {
    try {
        const counter = await counterModel.findOne({ _id: 'scheme_type' });
        if (!counter) {
            await counterModel.create({
                _id: 'scheme_type',
                seq: 1
            });
        }
    } catch (error) {
        console.error('Error initializing counter:', error);
    }
};

const SchemeType = mongoose.model('SchemeType', schemeTypeSchema);


SchemeType.initCounter();

export default SchemeType;