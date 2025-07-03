import gatewayModel from "../../../models/chit/gatewaySettingModel.js"

class GatewaySettingRepository{
    async exists(id_branch, id_project, id_client) {
        try {
         let gatewayData = await gatewayModel.findOne({ id_branch, id_project, id_client });

         return gatewayData ? gatewayData : null;
        } catch (error) {
          console.error(error)
          return false;
        }
      }

      async addSettings(data) {
        try {
          const newSetting = await gatewayModel.create(data);
          return newSetting;
        } catch (error) {
          console.error("Error adding settings:", error);
          return null;
        }
      }
    
      async updateOne(id,data) {
        try {
          const newSetting = await gatewayModel.updateOne(
            {_id:id},
            {$set:data}
          )
    
          if(!newSetting){
            return null
          }
    
          return newSetting;
        } catch (error) {
          console.error("Error adding settings:", error);
          return null;
        }
      }
    
      async getSettingByBranch(branchId) {
        try {
          return await gatewayModel.find({ id_branch: branchId });
        } catch (error) {
          console.error("Error fetching settings by branch:", error);
          return null;
        }
      }
    
      async getByProjectAndBranch(projectId, branchId) {
        try {
          return await gatewayModel.findOne({ id_project: projectId, id_branch: branchId });
        } catch (error) {
          console.error("Error fetching settings by project and branch:", error);
          return null;
        }
      }

}

export default GatewaySettingRepository;