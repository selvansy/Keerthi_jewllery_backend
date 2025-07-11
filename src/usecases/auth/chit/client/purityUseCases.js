import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import MetalRepository from "../../../../infrastructure/repositories/chit/MetalRepository.js";

class PurityUseCase { 
  constructor(purityRepository,metalRateRepo) {
    this.purityRepository = purityRepository;
    this.metalRateRepo = metalRateRepo;
    this.metalRepo = new MetalRepository();
  }

  async addPurity(data,token) {
    try {
      const exists = await this.purityRepository.findOne({
        purity_name: { $regex: new RegExp(`^${data.purity_name}$`, "i") },is_deleted:false
      });

      if (exists) {
        return { success: false, message: "Purity already exists" };
      }

      const metalData = await this.metalRepo.findById(data.id_metal)

      data.metalNumber = metalData.id_metal;
      const savedData = await this.purityRepository.addPurity(data);

      if (!savedData) {
        return { success: false, message: "Failed to add purity" };
      }

      // const metalRate = {
      //   id_branch: token.id_branch,
      //   purity_id: savedData._id,
      //   material_type_id: data.id_metal,
      //   rate: 0,
      //   created_by: token.id_employee,
      //   modified_by:  token.id_employee
      // };      

      // await this.metalRateRepo.addInitialRate(metalRate)
      return { success: true, message: "Purity added successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while adding purity" };
    }
  }

  async updatePurity(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const exists = await this.purityRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No purity found" };
      }

      const normalizeValue = (value) => {
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();
        }
        return value;
      };

      const updates = {};
      if (
        "purity_name" in data &&
        normalizeValue(data.purity_name) !== normalizeValue(exists.purity_name)
      ) {
        updates.purity_name = data.purity_name;
      }
      if (
        "id_metal" in data &&
        normalizeValue(data.id_metal) !== normalizeValue(exists?.id_metal?._id)
      ) {
        updates.id_metal = data.id_metal;
      }

      if (Object.keys(updates).length === 0) {
        return {
          success: false,
          message: "No changes detected, nothing to update",
        };
      }

      const savedData = await this.purityRepository.updatePurity(id,updates);

      if (!savedData) {
        return { success: false, message: "Failed to update purity" };
      }

      const metaRate = await this.metalRateRepo.getByPurityId(id)

      await this.metalRateRepo.updateMetalId(metaRate._id,data.id_metal)
      return { success: true, message: "Purity updated successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while updating purity" };
    }
  }

  async deletePurity(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const exists = await this.purityRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No purity found" };
      }

      if (exists.is_deleted) {
        return { success: false, message: "Already deleted purity" };
      }

      const savedData = await this.purityRepository.deletePurity(id);

      if (!savedData) {
        return { success: false, message: "Failed to delete purity" };
      }

      return { success: true, message: "Purity deleted successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting purity" };
    }
  }

  async activatePurity(id){
    try {
        if(!isValidObjectId(id)){
            return {success:false, message:'Provide a valid object id'}
        }

        const existingData = await this.purityRepository.findById(id);

        if(!existingData){
            return {success:false,message:'No documents found'}
        }

        if(existingData.is_deleted){
            return {success:false,message:"Deleted document action not permited"}
        }

        
        const newData= await this.purityRepository.activatePurity(id,existingData.active)

        if(!newData){
            return {success:false,message:'Failed change active state'}
        }

        let message = existingData.active ?
        "Purity deactivated successfullly" :
        "Purity activated successfully"

        return {success:true,message:message}
    } catch (error) {
        console.error(error);
        return {success:false,message:'Error while changing active state'}
    }
  }

  async purityDisplaySettings(id){
    try {
        if(!isValidObjectId(id)){
            return {success:false, message:'Provide a valid object id'}
        }

        const existingData = await this.purityRepository.findById(id);

        if(!existingData){
            return {success:false,message:'No documents found'}
        }

        if(existingData.is_deleted){
            return {success:false,message:"Deleted document action not permited"}
        }

        if(!existingData.active){
            return {success:false,message:'Purity not active action not permit'}
        }

        const newData= await this.purityRepository.purityDisplaySettings(id,existingData.display_app)

        if(!newData){
            return {success:false,message:'Failed change active state'}
        }

        let message = existingData.display_app ?
        "App display deactivated successfully" :
        "App display activated successfully"

        return {success:true,message:message}
    } catch (error) {
        console.error(error);
        return {success:false,message:'Error while changing display state'}
    }
  }

  async getPurityById(id){
    try {
        if(!isValidObjectId(id)){
            return {success:false,message:'Provide a valid object id'}
        }

        const existingData = await this.purityRepository.findById(id);

        if(!existingData){
            return {success:false,message:'No documents found'}
        }

        if(existingData.is_deleted){
            return {success:false,message:'Deleted document'}
        }


        return {success:true,message:'Purity data fetched successfully',data:existingData}
    } catch (error) {
        console.error(error);
        return {success:false,message:'Error while fetching purity data'}
    }
  }

  async getPurityByMetalId(id){
    try {
      let existingData
      if(isValidObjectId(id)){
        existingData = await this.purityRepository.find({id_metal:id,active:true,is_deleted:false});
       }else{
        existingData = await this.purityRepository.findByNum(id)
       }

        if(!existingData){
            return {success:false,message:'No documents found'}
        }

        return {success:true,message:'Purity data fetched successfully',data:existingData}
    } catch (error) {
        console.error(error);
        return {success:false,message:'Error while fetching purity data'}
    }
  }

  async getAllPurity(){
    try {
        const Data = await this.purityRepository.find({active:true,is_deleted:false});

        if(!Data){
            return {success:false,message:'No purity data found'}
        }

        return {success:true,message:'Purity data fetched successfully',data:Data}
    } catch (error) {
        console.error(error);
        return {success:false,message:'Error while fetching purity data'}
    }
  }

  async puityTable(page=1, limit=10, search) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
            $or: [
              { purity_name: { $regex: searchTerm, $options: "i" } }
            ],
          }
        : {};

      const query = {
       is_deleted:false,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.purityRepository.puityTable({
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
      console.error("Error in getAllPurity:", error);
      return { success: false, message: "An error occurred while fetching purity data" };
    }
  }
}

export default PurityUseCase;