import mongoose from 'mongoose';

const accessSchema = new mongoose.Schema({
   
    id_role: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Profile'
    },
    id_submenu: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'subMenuSetting'
    },
    view_permit: {
        type: Boolean,
        required: false,
        default:false
    },
    add_permit: {
        type: Boolean,
        required: false,
        default:false
    },
    edit_permit: {
        type: Boolean,
        required: false,
        default:false
    },
    delete_permit: {
        type: Boolean,
        required: false,
        default:false
    }
}, {
    timestamps: true
})

export default mongoose.model("Access", accessSchema);