import mongoose from "mongoose";

const CampaignTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // enum: ["Festival", "Diwali", "Pongal", "New Year", "Wishes", "Other", "New arrivals", "Product", "Branch" ], // Add more as needed
    },
    description: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// CampaignTypeSchema.index({ name: 1 });

export default  mongoose.model("CampaignType", CampaignTypeSchema);
