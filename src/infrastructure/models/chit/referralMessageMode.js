import mongoose, { Schema } from "mongoose"

const referralMessageSchema = new Schema({
    message:{
        type:String
    },
    appLink:{
        type:String
    },
    faq:{
        type:[
            {
                type:String
            }
        ]
    }
})

export default mongoose.model("referralMessage",referralMessageSchema)