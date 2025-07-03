import { isValidObjectId } from "mongoose";

class GeneralSettingUseCase {
    constructor(generalSettingRepo) {
      this.generalSettingRepo = generalSettingRepo;
    }
  
    async addSettings(data) {
      try {
        const exists = await this.generalSettingRepo.exists(data.id_branch, data.id_project, data.id_client);

        if (exists) {
          await this.generalSettingRepo.updateOne(exists._id,data)
          return { success: true, message: "General setting updated" };
        }
  
        const savedSetting = await this.generalSettingRepo.addSettings(data);
        if (!savedSetting) {
          return { success: false, message: "Failed to add general setting" };
        }
  
        return { success: true, message: "General setting added successfully", data: savedSetting };
      } catch (error) {
        console.error(error);
        return { success: false, message: "Error while adding settings" };
      }
    }
  
    async getSettingByBranch(branchId) {
      try {
        if(!isValidObjectId(branchId)){
          return {success:false,message:"Provide a valid object id"
          }
        }

        const settings = await this.generalSettingRepo.getSettingByBranch(branchId);
        if (!settings) {
          return { success: false, message: "No settings found for this branch" };
        }
        return { success: true, data: settings};
      } catch (error) {
        console.error(error);
        return { success: false, message: "Error fetching settings by branch" };
      }
    }
  
    async getByProjectAndBranch(projectId, branchId) {
      try {
        const setting = await this.generalSettingRepo.getByProjectAndBranch(projectId, branchId);
        if (!setting) {
          return { success: false, message: "No settings found for this project and branch" };
        }
        return { success: true, data: setting };
      } catch (error) {
        console.error(error);
        return { success: false, message: "Error fetching settings by project and branch" };
      }
    }
  }
  
  export default GeneralSettingUseCase;  