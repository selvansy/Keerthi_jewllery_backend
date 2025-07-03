import mongoose from "mongoose";
import { type } from "os";

const schemeSchema = new mongoose.Schema(
  {
    // **Basic Information**
    scheme_name: { type: String, required: true }, // Scheme Name
    code: { type: String, required: true }, // Unique Scheme Code
    description: { type: String, required: true }, // Scheme Description
    term_desc: { type: String, required: true }, // Terms Description
    logo: { type: String }, // Scheme Logo  // required removed for digigold compatibility
    desc_img: { type: String, required: false }, // Scheme Description Image
    final_join_date:{type:Date},

    // **Branch & Classification**
    id_branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Branch",
    }, // Branch ID
    id_classification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchemeClassification",
    }, // Classification ID

    // **Metal & Purity**
    id_metal: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Metal",
    }, // Metal ID
    id_purity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Purity",
    }, // Purity ID

    // **Scheme Type**
    scheme_type: { type: Number, required: true, default: 1 }, // 0 - Amount, 1 - Weight

    // **Amount & Installments**
    installment_type: { type: Number, default: 1 }, // 1 - Month, 2 - Week
    total_installments: { type: Number, default: 0 }, // Total Installments

    max_paidamount: { type: Number, default: 0.0 }, // Max Paid Amount
    max_installments: { type: Number, default: 0 }, // Max Installments

    comp_installment: { type: Number, default: 0 }, // Completed Installments
    limit_installment: { type: Number, default: 0 }, // Installment Limit
    pending_installment: { type: Number, default: 0 }, // Pending Installments
    wastagebenefit: { type: Number, required: true, default: 1 }, // 1 - Yes, 2 - No
    makingcharge: { type: Number, default: 2 }, // 1 - Zero, 2 - Non Zero
    benefit_min_installment_wst_mkg: { type: Number, default: 0 }, // Bonus Benefit
    // benefit_bonus: { type: Number, default: 2 }, // Bonus Benefit
    gift_minimum_paid_installment: { type: Number, default: 0 },

    amount: { type: Number, default: 0 }, // - because Scheme Amount

    min_amount: { type: Number, default: 0 }, // Minimum Amount
    max_amount: { type: Number, default: 0 }, // Maximum Amount

    totalCountAmount: { type: Number, default: 0 }, // Total Counted Amount
    startingAmount: { type: Number, default: 0 }, // Starting Amount
    incrementRate: { type: Number, default: 0 }, // Increment Rate
    fixed_amounts: [{ type: Number }], // Fixed Amounts Array

    // **Payment & Discounts**
    // buygsttype: { type: Number, default: 0 }, // Buy Tax GST Type
    // buy_gst: { type: Number, default: 0 }, // Buy GST Value
    // sell_gst: { type: Number, defaul: 0 }, // sell gst for digigold

    // **Customer & Limits**
    limit_customer: { type: Number, default: 0 }, // Customer Limit
    allow_customer: { type: Boolean, default: false }, // Allow Customer
    allowed_mininstall: { type: Number, default: 0 }, // Allowed Minimum Installments
    allowed_minpaid: { type: Number, default: 0 }, // Allowed Minimum Paid

    // **Weight Limits**
    min_weight: { type: Number, default: 0 }, // Minimum Weight
    max_weight: { type: Number, default: 0 }, // Maximum Weight

    // **Commissions & Fees**
    // **Customer**
    customer_referral_per: { type: Number, default: 0 },
    customer_incentive_per: { type: Number, default: 0 },
    customer_ref_remarks: { type: String },

    // **Agent**
    agent_restriction: { type: Boolean }, //
    agent_incentive:{type:Number},
    agent_percentage: { type: Number, default: 0 }, // Agent Commission Percentage
    agent_gift_percentage: { type: Number, default: 0 }, // Gift Percentage

    // agent_collection_percentage: { type: Number, default: 0 }, // Collection Percentage
    // agent_exist_collection_percentage: { type: Number, default: 0 }, // Existing Collection Percentage

    agent_referral_percentage: { type: Number, default: 0 }, // Referral Percentage

    agent_target_per: { type: Number, default: 0 }, // Collection Percentage
    agent_partial_per: { type: Number, default: 0 }, // partial commision based on referral

    agent_ref_remarks: { type: String },

    // **Fine Management**
    fine_amount: { type: Number, default: 0 }, // Fine Amount
    reduce_fine_amount: { type: Number, default: 0 }, // Reduced Fine Amount
    cumulative_fine_amount: { type: Number, default: 0 }, // Cumulative Fine Amount
    convenience_fees: { type: Number, default: 0 }, // Convenience Fees
    limit_notpaid: { type: Number, default: 0 }, // Limit for Non-Payment

    // **Grace Period**
    grace_type: { type: Number }, // Installment Type (1,2,3,4)
    grace_period: { type: Number, default: 0 }, // Grace Period in Days
    grace_fine_amount: { type: Boolean, default: false }, // Grace Fine Applied?
    grace_fine: { type: Number, default: 0.0 }, // Grace Fine Amount

    // **Referral System**
    referral_visible: { type: Number, default: 1 }, // Referral Visibility
    reward_point: { type: Number, default: 0 }, // Reward Points

    // **Preclose & Complement Rules**
    allow_installment: { type: Number, default: 0 }, // Allow Installments
    allow_complement: { type: Number, default: 0 }, // Allow Complement
    allow_collection: { type: Number, default: 0 }, // Allow Collection
    allow_preclose: { type: Number, default: 0 }, // Allow Preclose

    // **Maturity & Savings**
    maturity_period: { type: Number, default: 1 }, // Maturity in Months
    maturity_month: { type: Date, default: 1 },
    // ** Fund Details **
    saving_type: { type: Number, default: 1 }, // Saving Type (e.g. Fixed, Recurring)
    min_fund: { type: Number, default: 0 }, // Minimum Fund
    max_fund: { type: Number, default: 0 }, // Maximum Fund

    // **Gift Type**
    // gift_type: { type: Number, default: 1 }, // Gift Type (1,2,3...)
    no_of_gifts: { type: Number },

    // **Status Flags**
    active: { type: Boolean, default: true }, // Active Status
    is_deleted: { type: Boolean, default: false }, // Soft Delete Flag
    display_referral: { type: Boolean, default: false }, // Soft Delete Flag
    display_Weight_in_ledger: { type: Boolean, default: false }, // Soft Delete Flag
    wallet_redemption_onpayment: { type: Boolean, default: false }, //redeem points on payment time

    // **Timestamps & User Info**
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Created by Employee
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Created by Employee
    date_add: { type: Date, default: null }, // Date Added
    date_upd: { type: Date, default: null }, // Last Updated
    bonus_type:{
      type:Number,
      default:null
    },
    bonus_amount:{
      type:Number
    },
    bonus_percent:{
      type:Number
    },
    not_paid_installment:{
      type:Number,
    },
    classification_order:{
      type:Number
    },
    //digigold fields
    values: {
      type: [
        {
          min: {
            type: Number,
          },
          max: {
            type: Number,
          },
          value: {
            type: Number,
          },
        },
      ],
    },
    bonuses: {
      type: [Number],
    },
    entry_type: {
      type: Number
    },
    count: {
      type: Number,
    },
    referralPercentage:{
      type:Number,
      default:0
    },
    noOfDays:{
      type:Number,
      default:null
    },
    maxLimit:{ //maximum gross payment limit for digi gold
      type:Number,
      default:0
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Scheme", schemeSchema);