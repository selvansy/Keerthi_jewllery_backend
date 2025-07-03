import { isValidObjectId } from "mongoose";

class NotificationSettingUseCase {
  constructor(notificationSettingRepository) {
    this.notificationSettingRepository = notificationSettingRepository;
  }

  addOrUpdateNotificationSetting = async (data) => {
    try {
      const {
        id_branch,
        id_project,
        id_client,
        notifyappid,
        notifyauthirization,
        notify_sent,
        newarrival_sent,
        product_sent,
        offers_sent,
      } = data;

      const existingSetting = await this.notificationSettingRepository.findOne(
        id_branch,
        id_project
      );

      if (existingSetting) {
        const updateFields = {};
        if (id_client) updateFields.id_client = id_client;
        if (notifyappid) updateFields.notifyappid = notifyappid;
        if (notifyauthirization)
          updateFields.notifyauthirization = notifyauthirization;
        if (notify_sent) updateFields.notify_sent = notify_sent;
        if (newarrival_sent) updateFields.newarrival_sent = newarrival_sent;
        if (product_sent) updateFields.product_sent = product_sent;
        if (offers_sent) updateFields.offers_sent = offers_sent;

        const updatedSetting = await this.notificationSettingRepository.updateOne(
          existingSetting._id,
          updateFields
        );

        if(updatedSetting.modifiedCount === 0){
            return {success:false, message:'Failed to update notification settings'}
        }

        return {
          success: true,
          message: "Notification setting updated successfully",
          data: updatedSetting,
        };
      } else {
        const newSetting = await this.notificationSettingRepository.create({
          id_branch,
          id_project,
          id_client,
          notifyappid,
          notifyauthirization,
          notify_sent,
          newarrival_sent,
          product_sent,
          offers_sent,
        });

        if(!newSetting){
            return {success:false,message:'Failed to add notification settings'}
        }
        return {
          success: true,
          message: "Notification setting added successfully",
          data: newSetting,
        };
      }
    } catch (error) {
      console.error(error);
      return { status: 500, message: "Internal server error" };
    }
  };

  async getByBranchId(branchId){
    try {
        if(!isValidObjectId(branchId)){
            return {success:false,message:'Provide a valid object id'}
        }

        const data= await this.notificationSettingRepository.findByBranchId(branchId)

        if(!data){
            return {success:false,message:"No notification setting data found"}
        }
        
        return {success:true,message:'Notification settins fetched successfully',data:data}
    } catch (error) {
        console.error(error)
    }
  }

  async getByProjectAndBranch(projectId,branchId){
    try {
        if(!isValidObjectId(branchId)){
            return {success:false,message:'branch id is not a valid object id'}
        }else if(!isValidObjectId(projectId)){
            return {success:false, message:"Project id is not a valid object id"}
        }

        const data= await this.notificationSettingRepository.getByProjectAndBranch(projectId,branchId)

        if(!data){
            return {success:false,message:"No notification setting data found"}
        }
        
        return {success:true,message:'Notification settins fetched successfully',data:data}
    } catch (error) {
        console.error(error)
    }
  }
}

export default NotificationSettingUseCase;