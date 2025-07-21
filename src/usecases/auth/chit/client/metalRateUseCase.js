import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import smsService from "../../../../config/chit/smsService.js";
import CustomerRepository from "../../../../infrastructure/repositories/chit/CustomerRepository.js";

class metalRateUseCase { 
  constructor(metalrateRepository,metalRepo) { 
    this.metalRateRepository = metalrateRepository;
    this.metalRepo= metalRepo;
    this.customerRepo = new CustomerRepository()
  }

  async addMetalRate(data) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, message: "Invalid data format" };
      }
  
      const savedData = await this.metalRateRepository.addMetalRate(data);
  
      if (!savedData) {
        return { success: false, message: "Failed to add metal rate" };
      }
  
      const response = {
        success: true,
        message: "Metal rate added successfully",
        data: savedData,
      };
  
      process.nextTick(async () => {
        try {
          const messageLines = data.map(item => {
            const metal = item.metal_name || "Unknown Metal";
            const purity = item.purity_name || "Unknown Purity";
            const rate = typeof item.rate === "number" ? item.rate.toFixed(2) : "-";
            return `${metal} (${purity}): ₹${rate}/g`;
          });
  
          const messageContent = messageLines.join(" | ");
          const subscribers = await this.customerRepo.getExternal();
  
          const input = {
            recipients: subscribers || [],
            title: "Metal Rate Updated",
            message: messageContent,
            channel: "push",
            type: "Notification",
            sendToAllSubscribed:true
          };
  
          await smsService.sendNotification(input);
        } catch (err) {
          console.error("Push notification failed:", err.message);
        }
      });
  
      return response;
    } catch (error) {
      console.error("addMetalRate error:", error);
      return {
        success: false,
        message: "An error occurred while adding metal rate",
      };
    }
  }   

  async editMetalRate(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.metalRateRepository.findById(id);

      if (!exists) {
        return {success:false,message:"Metal rate not found"}
      } else if (exists.is_deleted) {
        return { success: false, message: "Deleted metal rate" };
      }

      const normalizeValue = (value) => {
        if (value instanceof mongoose.Types.ObjectId) {
            return value.toString();
        }
        if (value instanceof mongoose.Types.Decimal128) {
            return parseFloat(value.toString());
        }
        if (value instanceof Date) {
            return value.toISOString().split(".")[0] + "Z";
        }
        if (typeof value === "string" && !isNaN(parseFloat(value))) {
            return parseFloat(value);
        }

        return value;
    };
    

      let fieldsToUpdate = {};
      for (const key of Object.keys(data)) {
        if (
          [
            "_id",
            "createdAt",
            "updatedAt",
            "__v",
            "is_deleted",
            "created_by",
          ].includes(key)
        ) {
          continue;
        }

        const existingValue = exists[key] !== undefined ? normalizeValue(exists[key]) : undefined;
        const newValue = normalizeValue(data[key]);
        
        if (existingValue !== newValue && newValue !== Infinity && newValue !== null) {
            fieldsToUpdate[key] = data[key];
        }        
      }

      if (Object.keys(fieldsToUpdate).length === 0) {
        return { success: false, message: "No fields to update" };
      }

      const editedData = await this.metalRateRepository.editMetalRate(
        id,
        fieldsToUpdate
      );

      if (editedData) {
        return { success: true, message: "Metal rate edited successfully" };
      }

      return { success: false, message: "Failed to edit metal rate" };
    } catch (error) {
      console.error("Error in editMetalRate:", error);
      return {
        success: false,
        message: "An error occurred while editing metal rate",
      };
    }
  }

  async deleteMetalRate(id){
    try {
        if(!isValidObjectId(id)){
            return {success:false,message:"Provide a valid object id"}
        }

        const metalRate = await this.metalRateRepository.findById(id);

        if (!metalRate) {
            return { success: false, message: "Metal rate not found" };
        }

        if (metalRate.is_deleted) {
            return { success: false, message: "Metal rate is already deleted" };
        }

        const newData= await this.metalRateRepository.deleteMetalRate(id);

        if(newData){
            return {success:true,message:"Metal rate deleted"}
        }

        return {success:false,message:"Failed to delete metal rate"}
    } catch (error) {
        console.error(error);
        return {success:false,message:'An error occured while deleting metal rate'}
    }
  }

  async currenPreviousMetalRate(branchId){
    try {
        if(!isValidObjectId(branchId)){
            return {success:false,message:"Provide a valid object id"}
        }

        const metalRate= await this.metalRateRepository.currenPreviousMetalRate(branchId)

        if(metalRate.length === 0){
            return {success:false,message:"No metal rate found"}
        }

        return {success:true,message:'Metal rates fetched successfully',data:metalRate}
    } catch (error) {
        console.error(error);
        return {success:false,message:'An occured while getting current previous rate'}
    }
  }

  async todaysMetalRateByMetal(metalId,purity, date = null,branchId) {
    try {
      if (!isValidObjectId(metalId)) {
        return { success: false, message: "Invalid metal id" };
      }

      if (!isValidObjectId(branchId)) {
        return { success: false, message: "Invalid branch id" };
      }

      const metalData = await this.metalRepo.findById(metalId)

      if(metalData?.is_deleted){
        return {success:false,message:"No metal found, add new metal"}
      }
  
      const metalRate = await this.metalRateRepository.todaysMetalRateByMetal(metalId,purity,branchId, date);
  
      if (!metalRate) {
        return { success: false, message: "No metal rate found" };
      }
  
      return { success: true, message: "Metal rate fetched successfully", data: metalRate };
  
    } catch (error) {
      console.error("Error in Use Case:", error);
      return { success: false, message: "An error occurred while fetching metal rate" };
    }
  }

  async getMetalRate(branchId, date = null) {
    try {
      if (!isValidObjectId(branchId) && branchId !== "0") {
        return { success: false, message: "Invalid Branch ID" };
      }
  
     
      const metalRate = await this.metalRateRepository.getMetalRate(branchId, date);
    
  
      if (!metalRate) {
        return { success: false, message: "No metal rate found" };
      }
  
      return { success: true, message: "Metal rate fetched successfully", data: metalRate };
  
    } catch (error) {
      console.error("Error in Use Case:", error);
      return { success: false, message: "An error occurred while fetching metal rate" };
    }
  }
  
  async metalRateTable(page,limit,filter){
    try {
        const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const query = {
        is_deleted:false,
        ...filter
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
      const Data = await this.metalRateRepository.metalRateTable(
        query,
        documentskip,
        documentlimit
      );

      if (!Data || Data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Metal rate fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
       console.error(error);
       return {success:false,message:"An error occured while fetching metal rate datas"} 
    }
  }

  async getById(_id){
    try {
        if(!isValidObjectId(_id)){
            return {success:false,message:"Provide a valid object id"}
        }

        const metalRate= await this.metalRateRepository.findById(_id);

        if(!metalRate){
            return {success:false,message:"No metal rate found"}
        }

        return {success:true,message:"Metal rate fetched successfully",data:metalRate}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An occured while fetching todays metal rate"}
    }
  }
}



export default metalRateUseCase;