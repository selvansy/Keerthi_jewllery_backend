import { isValidObjectId} from "mongoose";
import mongoose from "mongoose";

class AppSettingUseCase {
    constructor(appsettingRepository
        ,branchRepository
    ){
        this.appsettingRepository= appsettingRepository;
        this.branchRepository= branchRepository;
    }
    async addAppSetting(data) {
        try {
            const branchId= data.id_branch;
            const projectId = data.id_project;
            const clientId = data.id_client;
            
          const existingData = await this.appsettingRepository.findOne({id_branch:branchId,id_project:projectId,id_client:clientId});
    
          if (existingData) {
            if (!mongoose.isValidObjectId(existingData._id)) {
              return { success: false, message: "Invalid object ID" };
            }
    
            const normalizeValue = (value) => {
              if (value instanceof mongoose.Types.ObjectId) return value.toString();
              if (value instanceof Date) return value.toISOString().split('.')[0] + 'Z';
              return value;
            };
    
            const fieldsToUpdate = Object.entries(data).reduce((acc, [key, value]) => {
              if (normalizeValue(existingData[key]) !== normalizeValue(value)) {
                acc[key] = value;
              }
              return acc;
            }, {});
    
            if (Object.keys(fieldsToUpdate).length === 0) {
              return { success: false, message: "No changes made, fields are identical" };
            }

            const updatedSetting = await this.appsettingRepository.updateAppSetting(existingData._id, fieldsToUpdate);
            return updatedSetting
              ? { success: true, message: "App setting updated successfully" }
              : { success: false, message: "Failed to update app setting" };
          } else {
            const savedSetting = await this.appsettingRepository.addAppSetting(data);
            return savedSetting
              ? { success: true, message: "App setting added successfully" }
              : { success: false, message: "Failed to add app setting" };
          }
        } catch (error) {
          console.error(error);
          return { success: false, message: "Internal server error" };
        }
      }

    async getAppSettingById(id){
        if(!isValidObjectId(id)){
            return {success:false,message:"ID is not a valid object id"}
        }

        const settingData= await this.appsettingRepository.findById(id);

        if(settingData){
            return {success:true,message:"Data fetched successfully",data:settingData}
        }

        return {success:false,message:"Failed to fetch data"}
    }

    async getAppSettingByProjectAndBranch(projectId,branchId){
      if(!isValidObjectId(projectId)){
          return {success:false,message:"Project id is not a valid object id"}
      }else if (!isValidObjectId(branchId)){
        return {success:false,message:"Branch id is not a valid object id"}
      }

      const settingData= await this.appsettingRepository.findOne({id_project:projectId,id_branch:branchId});

      if(settingData){
          return {success:true,message:"Data fetched successfully",data:settingData}
      }

      return {success:false,message:"Failed to fetch data"}
  }

    async getAppSettingByBranchId(id){
        if(!isValidObjectId(id)){
            return {success:false,message:"Provided a valid object id"}
        }

        const existingBranch= await this.appsettingRepository.findOne({id_branch:id})

        if(!existingBranch){
            return {success:false,message:"No branch found"}
        }

        const settingData= await this.appsettingRepository.getAppSettingByBranchId(id);

        if(settingData && settingData.length > 0){
            return {success:true,message:"Data fetched successfully",data:settingData}
        }else if(settingData.length === 0){
            return {success:false,message:"No app setting data found"}
        }

        return {success:false,message:"Failed to fetch data"}
    }

    async getAllAppSettings(page,limit){
        const pageNum = page ? parseInt(page) : 1;
        const pageSize = limit ? parseInt(limit) : 10;

        const query = {
          active: true,
          is_deleted:false
        };
    
        const documentskip = (pageNum - 1) * pageSize;
        const documentlimit = pageSize;
    
        const Data= await this.appsettingRepository.getAllAppSettings({
            query,
            documentskip,
            documentlimit
        });
    
        if(!Data || Data.length === 0){
            return {success:false,message:"No app settings found"}
        }

        return {
            success:true,
            message:"App settings fetched successfully",
            data:Data.data,
            totalCount:Data.totalCount,
            totalPages: Math.ceil(Data.totalCount / pageSize),
            currentPage: pageNum,
        }
      }
}

export default AppSettingUseCase;