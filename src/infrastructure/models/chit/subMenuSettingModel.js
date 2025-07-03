import mongoose from 'mongoose';

const submenusettingSchema = new mongoose.Schema({
    id_project: {
        type: mongoose.Schema.Types.ObjectId,
        // required: [true, 'Project access is required'],
        ref: "Project"
    },
    submenu_name: {
        type: String,
        required: true
    },
    id_menu: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Menu'
    },
    pathurl: {
        type: String,
        required: true
    },
    display_order: {
        type: Number,
        required: true
    },
    visible: {
        type: Boolean,
        default: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    adminVisible:{
        type:Boolean,
        default:false,
    }
}, {
    timestamps: true
});

export default mongoose.model('subMenuSetting', submenusettingSchema);