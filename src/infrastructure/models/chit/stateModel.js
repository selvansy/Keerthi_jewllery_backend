import mongoose from "mongoose";

const stateSchema = new mongoose.Schema({
    id_state:{
        type:String,
        required:true
    },
    state_name:{
        type:String,
        required:true
    },
    id_country:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"country"
    }
},{
    timestamps:true
})

export default mongoose.model("State",stateSchema);