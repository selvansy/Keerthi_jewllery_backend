import mongoose from "mongoose";

const schemeAccountSchema = new mongoose.Schema(
  {
    // accountschemeid: {
    //   type: Number,
    //   default: 0,
    // },
    id_classification: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SchemeClassification",
    },
    referral_code: {
      type: Number,
      required: false,
      default: 0,
    },
    referral_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      required: false,
    },    
    referral_type: {
      type: String,
      enum: ["Employee", "Customer","Agent",""],
      default:"",
      required: false,
    },
    // collectionuserid: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: null,
    // },
    referralpaid: {
      type: Boolean,
      default: false, // 0-No, 1-Yes
    }, 
    id_scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
    },
    total_installments: {
      type: Number,
      default: 0
    },
    paid_installments: {
      type: Number,
      default: 0
    },
    closebill_id: {
      type: String,
      required: false,
      default: "",
    },
    id_customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    id_branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Branch",
    },
    scheme_acc_number: {
      type: String,
      required: false,
    },
    account_name: {
      type: String,
      required: true,
    },
    scheme_count_number:{
      type:Number,
    },
    last_paid_date: {
      type: Date,
      default:null
    },
    start_date: {
      type: Date,
      required: false,
    },
    maturity_date: {
      type: String,
      required: false,
    },
    closed_date: {
      type: Date,
      default:null
    },
    revert_date: {
      type: Date,
    },
    gift_issues: {
      type: Number,
      required: true,
      default: 0,
    },
    complement: {
      type: Boolean,
      required: true,
      default: false,  // 0-no, 1-yes
    }, 
    typeofcustomer: {
      type: Number,
      required: true,
      default: 0, // 1- customer, 2- employee
    },
    paymentcount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    date_add: {
      type: Date,
      required: false,
    },
    date_upd: {
      type: Date,
      required: false,
    },
    added_by: {
      type: Number,
      required: true,
      default: 0, // 0 - WebApp, 1 - Android, 2 - Ios
    }, 
    closed_by: {
      type: String,
      required: true,
      default: 0,
    },
    revert_by: {
      type: String,
      required: true,
      default: 0,
    },
    status: {
      type: Number,
      required: true,
      default: 0,  // 0-open, 1-Closed, 2-completed
      enum:[0,1,2]
    },                
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Employee",
    },
    amount:{
      type:Number,
      default: 0
    },
    weight:{
      type:Number,
      default:0
    },
    completedDate:{
      type:Date,
      default:null
    },
    flexFixed:{
      type:Number,
      default:0
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SchemeAccount", schemeAccountSchema);