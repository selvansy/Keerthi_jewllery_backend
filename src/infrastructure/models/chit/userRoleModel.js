import mongoose from 'mongoose';
import counterModel from './CounterModel.js';

const userroleSchema = new mongoose.Schema({
    id_role: {
        type: Number,
        unique: true,
    },
    role_name: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

userroleSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            let counter = await counterModel.findById('id_role');

            if (!counter) {
                counter = new counterModel({ _id: 'id_role', seq: 4 });
                await counter.save();
            }

            const updatedCounter = await counterModel.findByIdAndUpdate(
                'id_role',
                { $inc: { seq: 1 } },
                { new: true }
            );

            this.id_role = updatedCounter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

export default mongoose.model('UserRole', userroleSchema);