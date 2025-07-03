import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  sortname: {
    type: String,
    required: true,
    maxlength: 3
  },
  country_name: {
    type: String, 
    required: true,
    maxlength: 150
  },
  currency_name: {
    type: String,
    required: true,
    maxlength: 10
  },
  currency_code: {
    type: String,
    required: true,
    maxlength: 4
  },
  mob_code: {
    type: String,
    required: true,
    maxlength: 5
  },
  mob_no_len: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  date_upd: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Country', countrySchema);