import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
      active: {
        type: Boolean,
        default: true
      },
      is_deleted:{
        type:Boolean,
        default:false,
    },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Employee'
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Employee'
      }
    }, {
      timestamps: true
})

export default mongoose.model('Department',departmentSchema);