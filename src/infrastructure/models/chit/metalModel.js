import mongoose from "mongoose";
import counterModel from './CounterModel.js';

const metalSchema = new mongoose.Schema(
  {
    id_metal:{
      type:Number
    },
    id_metal: {
      type: Number,
      required: true,
      default: 1,
    },
    metal_name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// metalSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     try {
//       const counter = await counterModel.findOneAndUpdate(
//         { _id: "id_metal" },
//         { $inc: { seq: 1 } },
//         {
//           new: true,
//           upsert: true,
//           setDefaultsOnInsert: true,
//         }
//       );

//       this.id_metal = counter.seq;
//       next();
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     next();
//   }
// });

// metalSchema.statics.initCounter = async function () {
//   try {
//     const counter = await counterModel.findOne({ _id: "id_metal" });
//     if (!counter) {
//       await counterModel.create({
//         _id: "id_metal",
//         seq: 1,
//       });
//     }
//   } catch (error) {
//     console.error("Error initializing counter:", error);
//   }
// };

const Metal = mongoose.model("Metal", metalSchema);

// Metal.initCounter();

export default Metal;


// export default mongoose.model('Metal', metalSchema);