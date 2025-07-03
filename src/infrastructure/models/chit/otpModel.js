import mongoose from "mongoose";

const otpSchema= new mongoose.Schema({
    mobile:{
        type:Number,
        required:true
    },
    send_otptime:{
        type:Date,
        required:true
    },
    otp_code:{
        type:Number,
        required:true
    },
    type:{
        type:String
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    verified_time:{
        type:Date,
        default:null
    }
},{
    timestamps:true
});

export default mongoose.model('Otp',otpSchema);