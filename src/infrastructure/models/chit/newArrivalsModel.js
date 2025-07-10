import mongoose from 'mongoose';

const newarrivalsSchema = new mongoose.Schema({
    id_branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Branch",
        required: true
    },
    id_product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Product'
    },
    // description: {
    //     type: String,
    // },
    active: {
        type:Boolean,
        default:true
        
    },
    // images_Url:{
    //     type:[String]
    // },
  
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Employee",
        required: true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    start_date:{
        type:Date,
        default:Date.now()
    },
    end_date:{
        type:Date,
        default:Date.now()
    }
},
    {
        timestamps: true 
    }
);

export default mongoose.model('NewArrivals',newarrivalsSchema);