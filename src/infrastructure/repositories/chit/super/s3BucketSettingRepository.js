import s3BucketModel from '../../../models/chit/s3BucketSettingModel.js';

class S3BucketRepository{
    async exists(id_branch, id_project, id_client) {
        try {
          // return !!(await s3BucketModel.findOne({ id_branch, id_project, id_client }));
          return await s3BucketModel.findOne({ id_branch, id_project, id_client });
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      async updateOne(id, data) {
        try {
          return await s3BucketModel.updateOne({ _id: id }, { $set: data });
        } catch (error) {
          console.error("Error updating SMS settings:", error);
          return null;
        }
      }
    
      async addSettings(data) {
        try {
          const newSetting = new s3BucketModel(data);
          return await newSetting.save();
        } catch (error) {
          console.error("Error adding SMS settings:", error);
          return null;
        }
      }
    
      async getSettingByBranch(branchId) {
        try {
          return await s3BucketModel.find({ id_branch: branchId }).select('-createdAt -updatedAt ')
        } catch (error) {
          console.error("Error fetching SMS settings by branch:", error);
          return null;
        }
      }

      async getSettingByClient(clientId) {
        
        try {
          return await s3BucketModel.findOne({ id_client: clientId }).select('-createdAt -updatedAt ')
        } catch (error) {
          console.error("Error fetching SMS settings by client:", error);
          return null;
        }
      }

      async getSetting() {
        try {
          return await s3BucketModel.findOne({}).select('-createdAt -updatedAt ')
        } catch (error) {
          console.error("Error fetching SMS settings by client:", error);
          return null;
        }
      }
    
      async getByProjectAndBranch(projectId, branchId) {
        try {
          return await s3BucketModel.findOne({ id_project: projectId, id_branch: branchId });
        } catch (error) {
          console.error("Error fetching SMS settings by project and branch:", error);
          return null;
        }
      }
}

export default S3BucketRepository;