import appVersionModel from "../../models/chit/appVersionModel.js";

class AppVersionRepository {
    async findOne(){
        try {
            const result = await appVersionModel.findOne({})

            return result
        } catch (error) {
            console.error(error)
        }
    }
    async addAppVersionData(data){
        try {
            const result = await appVersionModel.create(data)

            return result
        } catch (error) {
            console.error(error)
        }
    }

    async updateAppVersionData(id, data) {
        try {
          const result = await appVersionModel.updateOne(
            { _id: id },
            { $set: data }
          );
      
          return result.modifiedCount !== 0;
        } catch (error) {
          console.error(error);
          throw new Error("Failed to update app version data");
        }
      }
      
}

export default AppVersionRepository