import mongoose, {Schema} from 'mongoose';

const whatsappSchema = new mongoose.Schema({
    noti_name:{
        type:String,
        required:true
    },
    noti_desc:{
        type:String,
        required:true
    },
    noti_image:{
        type:String,
        required:true
    },
    mobileno:{
        type:String,
        required:true
    },
    typeway:{
        type:Number,
        required:true,
        enum: [1, 2],// 1-Default user, 2-Entry user
    },
    active:{
        type:Number,
        required:true,
        default:1 ,
        enum: [0, 1, 2] // 1- active, 2- in active, 0- delete
    },
    numberof_sent: { 
        type: Number, 
        required: true 
    },
    createdate:{
        type:String,
        required:true
    }},
    {
        timestamps: true
    }
);

export default mongoose.model('Whatsapp',whatsappSchema);