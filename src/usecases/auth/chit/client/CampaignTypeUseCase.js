import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

class CampaignTypeUseCase {
  constructor(campaignTypeRepository) {
    this.campaignTypeRepository = campaignTypeRepository;
  }

  async addCampaignType(data) {
    try {
      const exists = await this.campaignTypeRepository.findByName(data.name);

      if (exists) {
        return { success: false, message: "CampaignType already exists" };
      }

      const savedData = await this.campaignTypeRepository.addCampaignType(data);

      if (savedData) {
        return { success: true, message: "CampaignType created successfully" };
      }


      return { success: false, message: "Failed to create CampaignType" };
    } catch (error) {
      console.error("Error in addCampaignType:", error);
      return { success: false, message: "An error occurred while adding CampaignType" };
    }
  }

  async editCampaignType(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const existing = await this.campaignTypeRepository.findById(id);

      if (!existing) {
        return { success: false, message: "CampaignType not found" };
      }

      const normalizeValue = (value) => {
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();
        }
        if (value instanceof Date) {
          return value.toISOString().split(".")[0] + "Z";
        }
        return value;
      };

      let fieldsToUpdate = {};
      Object.keys(data).forEach((key) => {
        if (["createdAt", "updatedAt", "__v", "is_deleted"].includes(key)) {
          return;
        }
        if (normalizeValue(existing[key]) !== normalizeValue(data[key])) {
          fieldsToUpdate[key] = data[key];
        }
      });

      if (Object.keys(fieldsToUpdate).length === 0) {
        return { success: false, message: "No fields to update" };
      }

      const updatedData = await this.campaignTypeRepository.editCampaignType(
        id,
        fieldsToUpdate
      );

      if (updatedData) {
        return { success: true, message: "CampaignType updated successfully" };
      }

      return { success: false, message: "Failed to edit data" };
    } catch (error) {
      console.error("Error in editCampaignType:", error);
      return {
        success: false,
        message: "An error occurred while editing the CampaignType",
      };
    }
  }

  async deleteCampaignType(id) {
    try {
        if (!isValidObjectId(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }
    
          const exists = await this.campaignTypeRepository.findById(id);
    
          if(!exists){
            return {success:false,message:"No CampaignType setting found"}
          }

          if(exists.is_deleted){
            return {success:false,message:"Already deleted CampaignType"}
          }

          const deletedData= await this.campaignTypeRepository.deleteCampaignType(id);

          if(deletedData){
            return {success:true,message:'CampaignType deleted successfully'}
          }

          return {success:false,message:"Failed to delete CampaignType"}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occurred while deleting CampaignType"}
    }
  }

  async changeCampaignTypeActiveStatus(id){
    try {
          if (!isValidObjectId(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }
    
          const exists = await this.campaignTypeRepository.findById(id);
    
          if(!exists){
            return {success:false,message:"No CampaignType found"}
          }

          if(exists.is_deleted){
            return {success:false,message:"Deleted CampaignType unable to change status"}
          }

          const updatedData= await this.campaignTypeRepository.changeModeActiveStatus(id,exists.active);

          if(!updatedData){
            return {success:false,message:"Failed to change CampaignType status"}
          }

          let message= exists.active ?
          "CampaignType successfully deactivated"
          : "CampaignType successfully activated";
    
          return {success:true,message:message}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occured while switching CampaignType status"}
    }
  }

  async getCampaignTypeById(id){
    try {
        if (!isValidObjectId(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }

          const CampaignTypeData= await this.campaignTypeRepository.findById(id)

          if(!CampaignTypeData){
            return {success:false,message:"No CampaignType found"}
          }

          return {success:true, message:"CampaignType data fetched successfully",data:CampaignTypeData}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occured while fetching data"}
    }
  }

  async getAllCampaignType(){
    try {
          const CampaignTypeData= await this.campaignTypeRepository.findAll()

          if(!CampaignTypeData){
            return {success:false,message:"No CampaignType found"}
          }

          return {success:true, message:"CampaignType data fetched successfully",data:CampaignTypeData}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occured while fetching data"}
    }
  }

  async getAllActiveCampaignTypes(page, limit, search) {

    try {

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
            $or: [
              { name: { $regex: searchTerm, $options: "i" } }
            ],
          }
        : {};

      const query = {
        active: true,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.campaignTypeRepository.getAllActiveCampaignTypes({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in getAllCampaignTypes:", error);
      return { success: false, message: "An error occurred while fetching data" };
    }
  }
}

export default CampaignTypeUseCase;

