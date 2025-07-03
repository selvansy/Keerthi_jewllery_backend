import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
    id_project: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Project access is required'],
        ref: "Project"
    },
    menu_name: {
        type: String,
        required: true
    },
    menu_icon: {
        type: String,
        required: false
    },
    component_name: {
        type: String,
        trim: true,
    },
    menu_path: {
        type: String,
        trim: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    display_order: {
        type: Number,
        required: true,
        default: 0
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Menu', menuSchema);