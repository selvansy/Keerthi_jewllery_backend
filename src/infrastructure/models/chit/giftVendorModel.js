import mongoose from 'mongoose';

const giftVendorSchema = new mongoose.Schema(
  {
    vendor_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    gst: {
      type: String,
      required: false,
      default: '',
    },
    id_branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Branch',
    },
    active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Employee',
    },
    modify_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Employee',
    },
     is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('GiftVendor', giftVendorSchema);