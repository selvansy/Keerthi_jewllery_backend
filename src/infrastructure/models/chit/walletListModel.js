import mongoose from "mongoose";

const walletListSchema = new mongoose.Schema(
  {
    // id_customer: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Customer",
    // },
    // id_scheme_account: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "SchemeAccount",
    // },
    // wallet_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: null,
    // },
    wallet_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Wallet"
    },
    // wallet_type: {
    //   type: String,
    //   enum: ["Employee", "Customer"],
    //   default: "",
    // },

    credited_point: {
      type: Number,
    },
    credited_amount: {
      type: Number,
      required: true,
    },
    reward_mode: {
      type: Number,
      default: 1,
      enum: [1, 2], // 1-Referral, 2-Purchase reward
    },
    redeem_type: {
      type: Number, // 1-Direct, 2-Purchase
    },
    bill_no: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Employee",
    },
    modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WalletList", walletListSchema);