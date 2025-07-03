import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
  {
    branch_name: {
      type: String,
      required: [true, "Branch name is required"],
      minlength: [3, "Branch name must be at least 3 characters"],
      maxlength: [100, "Branch name cannot exceed 100 characters"],
    },
    branch_landline: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid mobile number!`,
      },
    },
    whatsapp_no: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid WhatsApp number!`,
      },
    },
    address: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^\d{6}$/, "Pincode must be a 6-digit number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    id_city: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "City is required"],
      ref: "City",
    },

    id_state: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "State is required"],
      ref: "State",
    },
    id_country: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Country is required"],
      ref: "Country",
    },
    id_client: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Client ID is required"],
      ref: "Client",
    },
    active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Branch", BranchSchema);
