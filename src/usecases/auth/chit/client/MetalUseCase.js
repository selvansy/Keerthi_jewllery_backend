import mongoose, { isValidObjectId } from "mongoose";
import PuriytRepository from "../../../../infrastructure/repositories/chit/purityReporsitory.js";
import MetalRateRepository from "../../../../infrastructure/repositories/chit/metalRateRepository.js";



class MetalUseCase {
  constructor(metalRepository) {
    this.metalRepository = metalRepository;
    this.purityRepo = new PuriytRepository()
    this.metalRateRepo = new MetalRateRepository()
  } 

  async addMetal(data, token) {
    try {
      const metalName = data.metal_name.toLowerCase().trim();
      const exists = await this.metalRepository.findByName(metalName);
  
      if (exists) {
        return { success: false, message: "Metal already exists" };
      }
  
      //unknown metal
      data.id_metal = 99;
  
      if (/^gold$/i.test(metalName)) {
        data.id_metal = 1;
      } else if (/^silver$/i.test(metalName)) {
        data.id_metal = 2;
      } else if (/^diamon[dt]$/i.test(metalName)) {
        data.id_metal = 3;
      } else if (/^platinum$/i.test(metalName)) {
        data.id_metal = 4;
      } else if (/^rose\s+gold$/i.test(metalName)) {
        data.id_metal = 5;
      } else if (/^white\s+gold$/i.test(metalName)) {
        data.id_metal = 6;
      } else if (/^titanium$/i.test(metalName)) {
        data.id_metal = 7;
      } else if (/^palladium$/i.test(metalName)) {
        data.id_metal = 8;
      } else if (/^rhodium$/i.test(metalName)) {
        data.id_metal = 9;
      } else if (/^copper$/i.test(metalName)) {
        data.id_metal = 10;
      } else if (/^brass$/i.test(metalName)) {
        data.id_metal = 11;
      } else if (/^stainless\s+steel$/i.test(metalName)) {
        data.id_metal = 12;
      } else if (/^tungsten$/i.test(metalName)) {
        data.id_metal = 13;
      } else if (/^zirconium$/i.test(metalName)) {
        data.id_metal = 14;
      } else if (/^cobalt$/i.test(metalName)) {
        data.id_metal = 15;
      } else if (/^nickel$/i.test(metalName)) {
        data.id_metal = 16;
      }
  
      const savedData = await this.metalRepository.addMetal(data);
  
      if (savedData) {
        const updatedPurities = await this.purityRepo.updateWithMetalNumber(data.id_metal, savedData._id);
  
        await this.metalRateRepo.getIds(token?.id_branch, null, updatedPurities, savedData._id);
  
        return { success: true, message: "Metal added successfully" };
      }
  
      return { success: false, message: "Failed to add metal" };
    } catch (error) {
      console.error("Error in addMetal:", error);
      return { success: false, message: "An error occurred while adding metal" };
    }
  }
  
  async editMetal(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }
      const exisits = await this.metalRepository.findById(id);

      if (!exisits) {
        return { success: false, message: "Metal not found" };
      }

      const metalName = await this.metalRepository.findByName(data.metal_name);

      if(metalName && metalName._id.toString() !== id){
        return {success:false,message:"Metal name already exists"}
      }

      const fieldToUpdate = {};
      if (exisits.metal_name !== data.metal_name) {
        fieldToUpdate.metal_name = data.metal_name;
      } else {
        return { success: false, message: "No fields to update" };
      }

      const updatedData = await this.metalRepository.editMetal(id, fieldToUpdate);

      if (updatedData.modifiedCount === 1) {
        return { success: true, message: "Metal updated successfully" };
      }

      return { success: false, message: "Failed to edit data" };
    } catch (error) {
      console.error("Error in editMetal:", error);
      return { success: false, message: "An error occurred while editing metal" };
    }
  }

  async getMetalById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Invalid object ID provided" };
      }
      const metalData = await this.metalRepository.findById(id);

      if (!metalData) {
        return { success: false, message: "No metal data found for the provided ID." };
      }

      return {
        success: true,
        message: "Metal data fetched successfully.",
        data: metalData,
      };
    } catch (error) {
      console.error("Error in getMetalById:", error);
      return { success: false, message: "An error occurred while fetching metal data" };
    }
  }

  async deleteMetal(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const deletedData = await this.metalRepository.deleteMetal(id);

      if (deletedData) {
        return { success: true, message: "Metal deleted successfully" };
      }

      return { success: false, message: "Failed to delete" };
    } catch (error) {
      console.error("Error in deleteMetal:", error);
      return { success: false, message: "An error occurred while deleting metal" };
    }
  }

  async toggleMetalActiveState(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Invalid object ID provided." };
      }

      const existsData = await this.metalRepository.findById(id);

      if (!existsData) {
        return {
          success: false,
          message: "No matching metal data found for the provided ID.",
        };
      }

      const metalData = await this.metalRepository.toggleMetalActiveState(id, existsData.active);

      if (!metalData) {
        return {
          success: false,
          message: "Failed to update the metal's active state.",
        };
      }

      const message = metalData.active
        ? "The metal has been successfully activated."
        : "The metal has been successfully deactivated.";

      return { success: true, message };
    } catch (error) {
      console.error("Error in toggleMetalActiveState:", error);
      return { success: false, message: "An error occurred while toggling metal's active state" };
    }
  }

  async metalTableData(page, limit, search) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
            $or: [
              { metal_name: { $regex: searchTerm, $options: "i" } },
            ],
          }
        : {};

      const query = {        
        ...searchCriteria,
        is_deleted:false
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.metalRepository.metalTableData({
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
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in getAllMetals:", error);
      return { success: false, message: "An error occurred while fetching all metals" };
    }
  }

  async getAllMetals(){
    try {
       const metalData = await this.metalRepository.findAll();

       if(!metalData){
        return {success:false,message:"No metal data found"}
       }

       return {success:true, message:"Metal data fetched successfully", data:metalData};
    } catch (error) {
      console.error(error);
      return {success:false, message:"Error while fetching metal data"}
    }
  }
}

export default MetalUseCase;