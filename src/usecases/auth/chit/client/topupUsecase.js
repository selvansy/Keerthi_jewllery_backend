import { isValidObjectId } from "mongoose";
import topupRepository from "../../../../infrastructure/repositories/chit/topupRepository.js"
import LoginUseCase from "../admin/LoginUseCase.js";

class topupUsecase { 
    constructor(topupRepository) {
        this.topupRepository = topupRepository;
    }

    addOneDay(dateStr) {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 1);
      return date.toISOString();
    }

    
    async createTopup(data, token) {
        try {
           
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid data provided");
            }
             
            const newData = {
                ...data,
                id_client:token?.id_client,
                created_by: data.created_by || token?.id_client,
                requestedDate: data.requestedDate || new Date(),
                remarks:""
            };

            const savedTopup = await this.topupRepository.createTopup(newData);

            if(savedTopup){
              return {
                success: true,
                message: "Top-up added successfully",
                data: savedTopup
            };
            }
           
            return {
              success: false,
              message: "Failed to add topup data",
              data: savedTopup
          };
        } catch (error) {
            console.error("Error in CreateTopupUseCase:", error.message);
            return { success: false, message: "Error saving top-up request", error: error.message };
        }
    }
    

    async UpdateTopup(data, id, token) {
      try {
          
          data.modified_by = token?.id_role._id,
          delete data._id;
          
          const savedConfig = await this.topupRepository.UpdateTopup(data,id);
         
          if (savedConfig) {  
              return {
                  success: true,
                  message: "Topup updated successfully",
                  data: savedConfig
              };
          }
  
          return { success: false, message: "Topup update failed" };
  
      } catch (error) {
          console.error("Error in UpdateTopup:", error);
          return { success: false, message: "Error saving configuration" };
      }
  }
  

    async getTopupByClientId(id) {
        try {
            if (!id) {
                return { success: false, message: "clientId is required" };
            }

            const config = await this.topupRepository.getTopupByClientId(id);
        

            if (!config) {
                return { success: false, message: "No configuration found for this client" };
            }
    
            return { success: true, message: "Configuration retrieved successfully", data: config };
        } catch (error) {
            console.error("Error in getConfigByUser:", error);
            return { success: false, message: "Error fetching configuration" };
        }
    }



    async getAllTopup({page, limit, search,from_date, to_date}) {
        try {
          const pageNum = page ? parseInt(page) : 1;
        
          const pageSize = limit ? parseInt(limit) : 10;
          
          const query = {
             active: true,
          };

          if (from_date && to_date) {
            const startDate = new Date(from_date);
            const endDate = new Date(to_date);
          
            if (isNaN(startDate) || isNaN(endDate)) {
              return { success: false, message: "Invalid date format" };
            }
          
            
            startDate.setUTCHours(0, 0, 0, 0);     
            endDate.setUTCHours(23, 59, 59, 999);    
          
            query.createdAt = { $gte: this.addOneDay(startDate), $lte: endDate };
          }
        
          const documentskip = (pageNum - 1) * pageSize;
          const documentlimit = pageSize;

    
    
          const Data = await this.topupRepository.getAllTopup({
            query,
            documentskip,
            documentlimit,
          });
    
          if (!Data || Data.length === 0) {
            return { success: true, message: "No data found",data:[] };
          }
    
          
          return {
            success: true,
            message: "Data fetched successfully",
            data: Data.data,
            totalDocument: Data.totalCount,
            totalPages: Math.ceil(Data.totalCount / pageSize),
            currentPage: pageNum,
          };
        } catch (error) {
            console.error("Error in getAllTopup UseCase:", error);
            return { success: false, message: "Error fetching configurations" };
        }
      }
    


    async getTopupByStatus({page, limit, search}) {
        
        try {
          const pageNum = page ? parseInt(page) : 1;
        
          const pageSize = limit ? parseInt(limit) : 10;
    
          const searchTerm = search || "";
    
          const searchCriteria = searchTerm
            ? {
                $or: [
                  { limitRate: { $regex: searchTerm, $options: "i" } },
                ],
              }
            : {};
    
          const query = {
            active: true,
            ...searchCriteria,
          };
    
          const documentskip = (pageNum - 1) * pageSize;
          const documentlimit = pageSize;

    
          const Data = await this.topupRepository.getTopupByStatus({
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
            data: Data,
            totalDocument: Data.totalCount,
            totalPages: Math.ceil(Data.totalCount / pageSize),
            currentPage: pageNum,
          };
        } catch (error) {
            console.error("Error in getTopupByStatus:", error);
            return { success: false, message: "Error getTopupByStatus" };
        }
      }
    
    


    async deleteConfig(id) {
        try {
            if (!isValidObjectId(id)) {
                return { success: false, message: "Invalid configuration ID" };
            }

            const deletedConfig = await this.topupRepository.deleteConfig(id);
            if (!deletedConfig) {
                return { success: false, message: "Failed to delete configuration" };
            }

            return { success: true, message: "Configuration deleted successfully" };
        } catch (error) {
            console.error("Error in deleteConfig:", error);
            return { success: false, message: "Error deleting notification configuration" };
        }
    }
}

export default topupUsecase;
