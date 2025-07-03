import { isValidObjectId } from "mongoose";

class WhatsAppUseCase{
   constructor(whatsappRepository){
    this.whatsappRepository= whatsappRepository;
   }

   async addWhatsappSetting(data){
    try {
        const exists = await this.whatsappRepository.findOne(data.id_branch,data.id_project,data.id_client);
        
        const dataToSave = {
            id_project: data.id_project || (exists ? exists.id_project : null),
            id_branch: data.id_branch || (exists ? exists.id_branch : null),
            id_client: data.id_client || (exists ? exists.id_client : null),
            whatsapp_type: data.whatsapp_type || (exists ? exists.whatsapp_type : null),
            whatsapp_sent: data.whatsapp_sent ?? (exists ? exists.whatsapp_sent : false),
            newarrival_sent: data.newarrival_sent ?? (exists ? exists.newarrival_sent : false),
            newarrival_key: data.newarrival_key || (exists ? exists.newarrival_key : null),
            product_sent: data.product_sent ?? (exists ? exists.product_sent : false),
            product_key: data.product_key || (exists ? exists.product_key : null),
            offers_sent: data.offers_sent ?? (exists ? exists.offers_sent : false),
            offers_key: data.offers_key || (exists ? exists.offers_key : null),
            wedding_sent: data.wedding_sent ?? (exists ? exists.wedding_sent : false),
            wedding_key: data.wedding_key || (exists ? exists.wedding_key : null),
            birthday_sent: data.birthday_sent ?? (exists ? exists.birthday_sent : false),
            birthday_key: data.birthday_key || (exists ? exists.birthday_key : null)
        };

        if (exists) {
            await this.whatsappRepository.updateWhatsappSettings(exists._id,dataToSave);
            return { success: true, message: "WhatsApp settings updated successfully" };
        } else {
            await this.whatsappRepository.addWhatsappSetting(dataToSave);
            return { success: true, message: "WhatsApp settings added successfully" };
        }

    } catch (error) {
        console.error(error);
        return {success:false,message:'Error while adding whatsapp settings'}
    }
   }

   async getByBranchId(branchId){
    try {
        if(!isValidObjectId(branchId)){
            return {success:false,message:'Provide a valid object id'}
        }

        const data = await this.whatsappRepository.findByBranch(branchId)

        if(!data){
            return {success:false,message:"No whatsapp settings found"}
        }

        return {success:true,message:"Whatsapp data fetched successfully",data:data}
    } catch (error) {
        console.error(error)
    }
   }

   async getByBranchAndProjectId(branchId,projectId){
    try {
        if(!isValidObjectId(branchId)){
            return {success:false,message:'Provide a valid object id'}
        }else if(!isValidObjectId(projectId)){
            return {success:false,message:"Project id is not valid object id"}
        }

        const data = await this.whatsappRepository.getByBranchAndProjectId(branchId,projectId)

        if(!data){
            return {success:false,message:"No whatsapp settings found"}
        }

        return {success:true,message:"Whatsapp data fetched successfully",data:data}
    } catch (error) {
        console.error(error)
    }
   }
}

export default WhatsAppUseCase;