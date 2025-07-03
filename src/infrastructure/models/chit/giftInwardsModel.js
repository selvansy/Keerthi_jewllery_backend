import mongoose, { Schema } from 'mongoose';
import counterModel from './CounterModel.js';

const giftinwardsSchema = new mongoose.Schema({
    gift_vendorid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'GiftVendor'
    },
    invoice_no:{
        type:String,
        required:true
    },
    id_gift:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'GiftItem'
    },
    barcode:{
        type:Number,
    },
    qty:{
        type:Number,
        required:true
    },
    inward_qty:{
      type:Number,
      required:true
    },
    price:{
        type:Number,
        required:true
    },
    id_branch:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Branch'
    },
    active:{
        type:Boolean,
        default:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Employee'
    },
    modified_by:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Employee'
    },
    // createdate:{
    //     type:Date,
    //     required:true,
    //     default:null
    // },
    // modifydate:{
    //     type:Date,
    //     default:null
    // },
    gst_percenty:{
        type:Number,
        required:true
    },
    cus_sellprice:{
        type:Number,
        required:true
    },
    total:{
      type:Number,
      default:0
    }
},{
    timestamps:true
});

giftinwardsSchema.pre('save', async function (next) {
    if (this.isNew) {
      try {
        let counter = await counterModel.findById('barcode');
  
        if (!counter) {
          counter = new counterModel({
            _id: 'barcode',
            barcode: 99
          });
          await counter.save();
        }
  
        const updatedCounter = await counterModel.findByIdAndUpdate(
          { _id: 'barcode' },
          { $inc: { barcode: 1 } },
          { new: true }
        );
  
        this.barcode = updatedCounter.barcode;
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  });

export default mongoose.model('GiftInwards',giftinwardsSchema)