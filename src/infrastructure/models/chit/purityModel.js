import mongoose from 'mongoose';
import counterModel from './CounterModel.js'; 

const puritySchema = new mongoose.Schema({
    id_purity: {
        type: Number,
        required: true,
        default: 1
    },
    id_metal:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Metal",
        required:true
    },
    purity_name: {
        type: String,
        required: true
    },
    display_app: {
        type: Boolean,
        default: true // true - show , false- don't show
    },
    active: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    metalNumber:{
        type:Number,
    },
}, {
    timestamps: true
});

export default mongoose.model('Purity', puritySchema);