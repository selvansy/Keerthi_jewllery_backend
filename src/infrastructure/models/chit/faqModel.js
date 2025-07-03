import mongoose from 'mongoose';
 
const FaqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String, // Supports HTML for rich text (Quill.js)
      required: true,
    },
    category: {      //  refer (http://localhost:3002/api/client/common/faq-category)
      type: Number,
      required: true,
    },
    order: {
      type: Number,
      default: 0, // For sorting FAQs in a specific order
    },
    active: {
      type: Boolean,
      default: true, // true = visible, false = hidden
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);
 
// Pre-save hook to auto-increment order if not set
FaqSchema.pre("save", async function (next) {
  if (this.order === 0) {
    const lastFaq = await this.constructor.findOne().sort("-order");
    this.order = lastFaq ? lastFaq.order + 1 : 1;
  }
  next();
});
 
export default mongoose.model('faq', FaqSchema);
 