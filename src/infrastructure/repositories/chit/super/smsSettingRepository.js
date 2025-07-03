import smsSettingModel from "../../../models/chit/smsSettingModel.js";

class SmsSettingRepository {

  async find(){
    try{
      return await smsSettingModel.find();
    }catch(error){
      console.error("Error checking existence:", error);
      return null;
    }
  }
  async exists(id_branch, id_project, id_client) {
    try {
      return await smsSettingModel.findOne({ id_branch, id_project, id_client });
    } catch (error) {
      console.error("Error checking existence:", error);
      return null;
    }
  }

  async findOne(query) {
    try {
      const smsData =  await smsSettingModel.findOne(query)
      .lean();

      return smsData ? smsData : null ;
    } catch (error) {
      console.error("Error checking existence:", error);
      return null;
    }
  }

  async updateOne(id, data) {
    try {
      return await smsSettingModel.updateOne({ _id: id }, { $set: data });
    } catch (error) {
      console.error("Error updating SMS settings:", error);
      return null;
    }
  }

  async addSettings(data) {
    try {
      const newSetting = new smsSettingModel(data);
      return await newSetting.save();
    } catch (error) {
      console.error("Error adding SMS settings:", error);
      return null;
    }
  }

  async getSettingByBranch(branchId) {
    try {
      return await smsSettingModel.find({ id_branch: branchId });
    } catch (error) {
      console.error("Error fetching SMS settings by branch:", error);
      return null;
    }
  }

  async getByProjectAndBranch(projectId, branchId) {
    try {
      return await smsSettingModel.findOne({ id_project: projectId, id_branch: branchId });
    } catch (error) {
      console.error("Error fetching SMS settings by project and branch:", error);
      return null;
    }
  }
}

export default SmsSettingRepository;