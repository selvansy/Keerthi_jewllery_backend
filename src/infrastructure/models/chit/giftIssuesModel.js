import mongoose from 'mongoose';

const giftIssuesSchema = new mongoose.Schema({
  issue_type: {
    type: Number,
    default: 1, // 1 - shceme type, 2- non scheme
  },
  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Branch',
  },
  id_customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Customer',
  },
  // divsion: {
  //   type: [String],
  //   required: true,
  // },  
  create_date: {
    type: Date,
    default: Date.now,
  },
  gifts: [
    {
      // id_giftinward: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftInwards', required: true },
      id_gift: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftItem', required: true },
      gift_code: { type: String, required: true },
      qty: { type: Number, required: true },
      // excess_amount: { type: Number, },
     
    },
  ],
  id_scheme_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchemeAccount',
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
},
  {
    timestamps: true
  });

export default mongoose.model('GiftIssues', giftIssuesSchema);