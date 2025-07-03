import NotificationConfigModel from "../../models/chit/notificationConfigModel.js";

class NotificationConfigRepository {
    async insertOrUpdateConfig(data) {
        try {
            let existingConfig = await NotificationConfigModel.findOne({ active: true });

            if (existingConfig) {
                return await NotificationConfigModel.findOneAndUpdate(
                    { active: true },
                    { $set: data },
                    { new: true }
                );
            } else {
                return await NotificationConfigModel.create(data);
            }
        } catch (error) {
            console.error("Error in insertOrUpdateConfig:", error);
            throw new Error("Error saving notification configuration");
        }
    }

    async getConfig() {
        try {
            return await NotificationConfigModel.findOne({ active: true })
                .sort({ createdAt: -1 }) 
                .exec();
        } catch (error) {
            console.error("Error in getConfig:", error);
            throw new Error("Error fetching latest active notification configuration");
        }
    }
    
    async getAllConfigs() {
        try {
            return await NotificationConfigModel.find()
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            console.error("Error in getAllConfigs:", error);
            throw new Error("Error fetching all notification configurations");
        }
    }
    

    async deleteConfig(id) {
        try {
            return await NotificationConfigModel.findOneAndDelete({ _id: id });
        } catch (error) {
            console.error("Error in deleteConfig:", error);
            throw new Error("Error deleting notification configuration");
        }
    }
}

export default NotificationConfigRepository;
