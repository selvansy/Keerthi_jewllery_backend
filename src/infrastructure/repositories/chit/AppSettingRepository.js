import AppSettingModel from '../../models/chit/appSettingModel.js'

class AppSettingRepository{
    async findOne(query){
        const appData= await AppSettingModel.findOne(query)

        if(appData){
            return appData;
        }
        
        return null;
    }

    async findById(id){
        const appData= await AppSettingModel.findById(id)

        if(appData){
            return appData;
        }
        
        return null;
    }

    async addAppSetting(data){
        const savedSetting= await AppSettingModel.create(data)

        if(savedSetting){
            return savedSetting;
        }

        return null;
    }

    async updateAppSetting(id,data){
        const updatedSetting= await AppSettingModel.updateOne(
            {_id:id},
            {$set:data},
            {new:true}
        );

        if(updatedSetting.modifiedCount===0){
            return null
        }
        
        return updatedSetting;
    }

    async deleteAppSetting(id){
        const deletedData= await AppSettingModel.updateOne(
            {_id:id},
            {$set:{is_deleted:false,active:false}}
        );

        if(deletedData.modifiedCount === 0){
            return null;
        }

        return deletedData;
    }

    async getAppSettingByBranchId(id){
        const Data= await AppSettingModel.find({id_branch:id,is_deleted:false});

        if(!Data){
            return null;
        }

        return Data;
    }

    async getAllAppSettings({query,documentskip,documentlimit}){
        const totalCount= await AppSettingModel.countDocuments()
        const Data= await AppSettingModel.find(query).skip(documentskip).limit(documentlimit)
        if(!Data) return null;
    
        return {data:Data,totalCount};
    }

    async exists(id_branch, id_project, id_client) {
        try {
          return !!(await AppSettingModel.findOne({ id_branch, id_project, id_client }));
        } catch (error) {
          console.error(`Error checking existence in ${this.model.modelName}:`, error);
          return false;
        }
      }
}

export default AppSettingRepository;