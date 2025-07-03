import mongoose from "mongoose";

const WeddingBirthdaySetting = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  type:{
    type:Number,
    required:true
  },
  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("WeddingBirthdaySetting", WeddingBirthdaySetting);
