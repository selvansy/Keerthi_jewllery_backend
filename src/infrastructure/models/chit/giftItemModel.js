import mongoose from 'mongoose';

const giftitemSchema = new mongoose.Schema(
  {
    gift_vendorid: {
         type: mongoose.Schema.Types.ObjectId,
         required: false,
         ref:'GiftVendor'
    },
    gift_name: {
      type: String,
      required: true
    },
    gift_code: {
      type: String,
      required: true
    },
    // description: {
    //   type: String
    // },
    id_branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:'Branch'
    },
    active: {
      type: Boolean,
      default: true
    },
    created_by: {
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"Employee"
    },
    createdate: {
      type: Date,
      required: true,
    },
    modify_by: {
      type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Employee"
    },
    modifydate: {
      type: Date,
      required: true,
    },
    is_deleted:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('GiftItem', giftitemSchema);