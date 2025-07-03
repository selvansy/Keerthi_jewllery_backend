import mongoose from "mongoose";

const TiceketRaiseSchema = new mongoose.Schema(
  {
    id_ticketNo: {
      type: String,
      unique: true,
      required: true,
    },
    id_branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Branch",
    },
    id_employee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    option: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachment: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewing", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ticketRaise", TiceketRaiseSchema);
