import notificationModel from '../../../models/chit/notify/notificationSettingModel.js'; 

class NotificationSettingRepository{

    async exists(id_branch, id_project, id_client) {
        try {
         const data= await notificationModel.findOne({ id_branch, id_project, id_client });

          if(!data){
            return false
          }

          return true;
        } catch (error) {
          console.error(error);
        }
      }

      async findOne(id_branch, id_project) {
        try {
          const  data= await notificationModel.findOne({ id_branch, id_project});

          if(!data){
            return null
          }

          return data;
        } catch (error) {
          console.error(error);
        }
      }

      // used by client while sending notificaiton to get notification enabled or not
      async getNotificaitonSettings(id_branch) {
        try {
          const  data= await notificationModel.findOne({id_branch});

          if(!data){
            return null
          }

          return data;
        } catch (error) {
          console.error(error);
        }
      }

      async updateOne(id,data) {
        try {
          const notiificationData =  await notificationModel.updateOne({ _id:id},{$set:data});

          if(!notiificationData){
            return null
          }
          
          return notiificationData
        } catch (error) {
          console.error(error);
        }
      }

      async create(data) {
        try {
          return !!(await notificationModel.create(data));
        } catch (error) {
          console.error(error);
        }
      }

      async findByBranchId(branchId) {
        try {
          const  data= await notificationModel.findOne({id_branch:branchId});

          if(!data){
            return null
          }

          return data;
        } catch (error) {
          console.error(error);
        }
      }

      async getByProjectAndBranch(projectId,branchId) {
        try {
          const  data= await notificationModel.findOne({id_branch:branchId,id_project:projectId});

          if(!data){
            return null
          }

          return data;
        } catch (error) {
          console.error(error);
        }
      }
}

export default NotificationSettingRepository;