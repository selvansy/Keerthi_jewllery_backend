import mongoose from 'mongoose';

const forgetpwdSchema= new mongoose.Schema({
    username:{
        type:String,
        requried:true
    },
    otpcode:{
        type:String,
        required:true
    },
    verify_status:{
        type:Number,
        required:true
    },
    create_date:{
        type:String,
        required:true
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Customer'
    }
},{
    timestamps:true
});

export default mongoose.model('ForgetPass',forgetpwdSchema);