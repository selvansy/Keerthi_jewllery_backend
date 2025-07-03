import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    id_project: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Project",
      },
    ],
    company_name: 
    { 
      type: String, 
      required: true 
    },
    shop_contact: 
    { 
      type: String, 
      required: true 
    },
    md_name: 
    { 
      type: String, 
      required: true 
    },
    md_mobile: 
    { 
      type: String,
       required: true
    },
    organiz_spocname: 
    { 
      type: String, 
      required: true 
    },
    organiz_spoccontact: 
    { 
      type: String, 
      required: true 
    },
    aupay_url: 
    { 
      type: String, 
      required: false, 
      default: "" 
    },
    ausale_url: 
    { 
      type: String, 
      required: false, 
      default: "" 
    },
    pawn_url: 
    { 
      type: String,
       required: false, 
       default: ""
    },
    aupay_active: 
    { 
      type: Boolean, 
      required: true, 
      default:false
    },
    ausale_active: 
    { 
      type: Boolean,
      default: false
    },
    pawn_active: 
    { 
      type: Boolean, 
      default: false
    },
    active: 
    { 
      type: Boolean, 
      default: true
    },
    is_deleted:{
      type:Boolean,
      default:false
    },
    sign_date:{
      type:Date,
      default:null
    },
    launch_date:{
      type:Date,
      default:null
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", clientSchema);