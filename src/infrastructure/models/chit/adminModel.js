import mongoose from "mongoose";

const superadminSchema = new mongoose.Schema({
    is_super:{
        type:Boolean,
        required:false
    },
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})

export default mongoose.model("Admin",superadminSchema);