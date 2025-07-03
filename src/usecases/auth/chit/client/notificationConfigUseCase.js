import { isValidObjectId } from "mongoose";
import NotificationConfigRepository from "../../../../infrastructure/repositories/chit/notificationConfigRepository.js";

class NotificationConfigUsecase {
    constructor() {
        this.notificationConfigRepo = new NotificationConfigRepository();
    }

    async saveOrUpdateConfig(data, token) {
        try {
            // if (!isValidObjectId(data.createdBy)) {
            //     return { success: false, message: "Invalid Employee ID" };
            // }

            data.updatedBy = token.id_employee;
            if (!data.createdBy) data.createdBy = token.id_employee;

            const savedConfig = await this.notificationConfigRepo.insertOrUpdateConfig(data);

            return {
                success: true,
                message: savedConfig ? "Notification config saved/updated successfully" : "Failed to save notification config",
                data: savedConfig
            };
        } catch (error) {
            console.error("Error in saveOrUpdateConfig:", error);
            return { success: false, message: "Error saving notification configuration" };
        }
    }

    async getConfigByUser() {
        try {
            // if (!isValidObjectId(createdBy)) {
            //     return { success: false, message: "Invalid Employee ID" };
            // }

            const config = await this.notificationConfigRepo.getConfig();
            if (!config) {
                return { success: false, message: "No configuration found for this user" };
            }

            return { success: true, message: "Configuration retrieved successfully", data: config };
        } catch (error) {
            console.error("Error in getConfig:", error);
            return { success: false, message: "Error fetching notification configuration" };
        }
    }

    async getAllConfigs() {
        try {
            const configs = await this.notificationConfigRepo.getAllConfigs();
            return { success: true, message: "Configurations retrieved successfully", data: configs };
        } catch (error) {
            console.error("Error in getAllConfigs:", error);
            return { success: false, message: "Error fetching notification configurations" };
        }
    }

    async deleteConfig(id) {
        try {
            if (!isValidObjectId(id)) {
                return { success: false, message: "Invalid configuration ID" };
            }

            const deletedConfig = await this.notificationConfigRepo.deleteConfig(id);
            if (!deletedConfig) {
                return { success: false, message: "Failed to delete configuration" };
            }

            return { success: true, message: "Configuration deleted successfully" };
        } catch (error) {
            console.error("Error in deleteConfig:", error);
            return { success: false, message: "Error deleting notification configuration" };
        }
    }
}

export default NotificationConfigUsecase;
