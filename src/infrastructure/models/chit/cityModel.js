import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
    city_name:{
        type:String,
        required:true
    },
    id_city:{
        type:String,
        required:true
    },
    id_state:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"state"
    }
},{
    timestamps:true
})

export default mongoose.model("City",citySchema)