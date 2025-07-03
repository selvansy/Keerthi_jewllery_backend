import whatsappMessageModel from "../../models/chit/whatsappMessageModel.js";

class WhatsappMessageRepository{
    async addWhatsappMessage(data){
        try {
            const savedData = await whatsappMessageModel.create(data);

            return savedData ? savedData : null
        } catch (error) {
            console.error(error)
        }
    }

    async deleteWhatsappMessage(id){
        try {
            const savedData = await whatsappMessageModel.updateOne({_id:id},{$set:{is_delete:true,active:false}});

            return savedData ? savedData : null
        } catch (error) {
            console.error(error)
        }
    }
}

export default WhatsappMessageRepository;