import mongoose from 'mongoose';
const { Schema } = mongoose;

const { Decimal128 } = mongoose.Types;
const metalRatesSchema = new Schema(
  {
    id_branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Branch'
    },

    purity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purity',
      required: true,
    },
    material_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Metal',
      required: true,
    },
    rate: {
      type: Number,
      // type: Decimal128,
      // default: Decimal128.fromString("0.00"),
      required: true,
    },


    // goldrate_22ct: {
    //   type: Decimal128,
    //   default: Decimal128.fromString("0.00")
    // },
    // goldrate_20ct: {
    //   type: Decimal128,
    //   default: Decimal128.fromString("0.00")
    // },
    // goldrate_24ct: {
    //   type: Decimal128,
    //   default: Decimal128.fromString("0.00")
    // },
    // silverrate_1gm: {
    //   type: Decimal128,
    //   default: Decimal128.fromString("0.00")
    // },
    // goldrate_18ct: {
    //   type: Decimal128,
    //   required: true,
    //   default: Decimal128.fromString("0.00")
    // },
    // goldcoin_1gm: {
    //   type: Decimal128,
    //   required: true,
    //   default: Decimal128.fromString("0.00")
    // },
    // platinum_1gm: {
    //   type: Decimal128,
    //   required: true,
    //   default: Decimal128.fromString("0.00")
    // },
    // diamond_1gm: {
    //   type: Decimal128,
    //   required: true,
    //   default: Decimal128.fromString("0.00")
    // },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee"
    },
    modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee"
    },
    active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);
export default mongoose.model('MetalRate', metalRatesSchema);