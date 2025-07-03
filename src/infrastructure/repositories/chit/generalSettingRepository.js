import generalSettingModel from "../../models/chit/generalSettingModel.js";

class GeneralSettingRepository {
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

  async find() {
    try {
      const generalData = await generalSettingModel.findOne()
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