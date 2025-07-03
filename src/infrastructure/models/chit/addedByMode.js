import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const addedbySchema = new mongoose.Schema({
    name: {
        type: String
    },
    type: {
        type: Number
    }
}, {
    timestamps: true
});

const AutoIncrement = AutoIncrementFactory(mongoose);

addedbySchema.plugin(AutoIncrement, { 
    inc_field: 'type', 
    start_seq: 1        
});

export default mongoose.model('AddedBy', addedbySchema);