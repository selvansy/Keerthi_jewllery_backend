import generalSettingModel from "../../../models/chit/generalSettingModel.js";

class GeneralSettingRepository {
  async exists(id_branch, id_project, id_client) {
    try {
      return !!(await generalSettingModel.findOne({ id_branch, id_project, id_client }));
    } catch (error) {
      console.error("Error checking existence:", error);
      return false;
    }
  }

  async addSettings(data) {
    try {
      const newSetting = new generalSettingModel(data);
      return await newSetting.save();
    } catch (error) {
      console.error("Error adding settings:", error);
      return null;
    }
  }

  async updateOne(id,data) {
    try {
      const newSetting = await generalSettingModel.updateOne(
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
      const generaltData = await generalSettingModel.findOne({ id_branch: branchId });

      if(!generaltData){
        return null;
      }

      return generaltData;
    } catch (error) {
      console.error("Error fetching settings by branch:", error);
      return null;
    }
  }

  async getByProjectAndBranch(projectId, branchId) {
    try {
      return await generalSettingModel.findOne({ id_project: projectId, id_branch: branchId });
    } catch (error) {
      console.error("Error fetching settings by project and branch:", error);
      return null;
    }
  }

  async findOne(branchId) {
    try {
      const generalData = await generalSettingModel.findOne({
        id_branch: branchId,
      })
        .populate([
          {
            path: 'id_branch',
            select: '_id branch_name',
          },
          {
            path: 'id_project',
            select: '_id name', 
          },
          {
            path: 'id_client',
            select: '_id company_name', 
          },
        ])
        .select(
          'referral_calc print_type account_number close_print purity display_agent display_receiptno digi_gold scheme_amount'
        )
        .lean()
        .exec();

      if (!generalData) {
        return null;
      }

      return generalData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default GeneralSettingRepository;
