import mongoose from 'mongoose'

const cassificationSchema= new mongoose.Schema({
      classification_name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      term_desc: {
        type: String,
        required: true
      },
      id_branch: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Branch'
      },
      typeofscheme: {
        type: Number,
        required: true,
        enum: [1, 2], // 1: Non-Digi Gold, 2: Digi Gold
        default: 1
      },
      active: {
        type: Boolean,
        default:true
      },
      logo: {
        type: String,
        required: true // name of logo with extension
      },
      desc_img: {
        type: String,
        required: true
      },
      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Employee'
      },
      is_deleted:{
        type:Boolean,
        default:false
      }
    },
    {
      timestamps: true
});

export default mongoose.model('Classification',cassificationSchema);