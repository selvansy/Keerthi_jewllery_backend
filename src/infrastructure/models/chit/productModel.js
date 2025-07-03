import mongoose from "mongoose";

const chargeSchema = new mongoose.Schema({
  mode:{
    type:String,
    enum:["amount","weight"],
    required:false
  },
  actualValue: {
    type: Number,
    required: false,
  },
  discountedValue: {
    type: Number,
    default: null,
  },
  discountedPercentage: {
    type: Number,
    default: null,
  },
  discountView: {
    type: Boolean,
    required: false,
  },
  mcView: {
    type: Boolean,
  },
  wastageView: {
    type: Boolean,
  },
});

const productSchema = new mongoose.Schema(
  {
    id_category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    id_branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Branch",
    },
    product_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    code: {
      type: String,
      required: true,
    },
    id_metal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },
    weight: {
      type: Number,
      default: null,
    },
    id_purity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purity",
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    product_image: {
      type: [String],
      default: null,
    },
    showprice: {
      type: Boolean,
      default:false,
      default: true,
    },
    makingCharges: {
      type: chargeSchema,
      required: false,
    },
    wastageCharges: {
      type: chargeSchema,
      required: false,
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
      required: true,
      ref: "Employee",
    },
    modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
