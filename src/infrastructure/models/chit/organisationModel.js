import mongoose from "mongoose";

const OrganisationSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    short_code: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    id_city: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "City",
    },
    id_state: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "State",
    },
    id_country: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Country",
    },
    email:{
        type:String,
        requried:true
    },
    website:{
        type:String
    },
    whatsapp_no:{
        type:String
    },
    toll_free:{
        type:Number
    },
    active:{
      type:Boolean,
      default:true
    },
    is_deleted:{
      type:Boolean,
      default:false
    },
    logo: {
      type: String,
    },
    small_logo: {
      type: String,
    },
    favicon: {
      type: String,
    },
    login: {
      type: String,
    },
    background: {
      type: String,
    },
    bottom_logo: {
      type: String,
    },
    secondary_color:{
      type:String
    },
    primary_color:{
      type:String
    },
    color:{
      type:String
    },
    background_color:{
      type:String
  },
  longitude:{
    type:String
  },
  latitude:{
    type:String
  },
  mapUrl:{
    type:String
  }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Organisation", OrganisationSchema);