import mongoose from 'mongoose';
import counterModel from './CounterModel.js';

const projectSchema= new mongoose.Schema({
    id_project:{
        type:Number
    },
    project_name: 
    {
        type:String,
        required:true
    },
    active: {
        type: Boolean,
        default: true
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

projectSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            let counter = await counterModel.findOne({ _id: 'id_project' });

            if (!counter) {
                counter = new counterModel({ _id: 'id_project', seq: 1 });
                await counterModel.save();
            }

            const updatedcounter = await counterModel.findOneAndUpdate(
                { _id: 'id_project' },
                { $inc: { seq: 1 } },
                { new: true }
            );

            this.id_project = updatedcounter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});




export default mongoose.model('Project',projectSchema);