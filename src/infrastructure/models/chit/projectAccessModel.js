import mongoose from 'mongoose';

const ProjectaccessSchema = new mongoose.Schema({ 

  id_client: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Client ID is required'],
    ref: "Client"
  },
  
   id_project:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Project'        
   }],

  id_branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Branch ID is required'],
    ref: "Branch"
  },
  active: { type: Boolean, default:true},
  is_deleted:{type:Boolean,default:false}

}, {
  timestamps: true, 
});

export default mongoose.model('Projectaccess', ProjectaccessSchema);