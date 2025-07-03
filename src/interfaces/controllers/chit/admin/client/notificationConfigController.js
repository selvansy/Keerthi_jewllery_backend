import { isValidObjectId } from "mongoose";

class NotificationConfigController {
    
    constructor(notificationConfigUsecase) {
        this.notificationConfigUsecase = notificationConfigUsecase;
    }

    async saveOrUpdateConfig(req, res) {
        try {
            const data = req.body;
            const token = req.user;

            // if (!isValidObjectId(token.id_employee)) {
            //     return res.status(400).json({ success: false, message: "Invalid Employee ID" });
            // }

            const result = await this.notificationConfigUsecase.saveOrUpdateConfig(data, token);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            res.status(200).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            console.error("Error in saveOrUpdateConfig:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getConfigByUser(req, res) {
        try {
            const result = await this.notificationConfigUsecase.getConfigByUser();

            if (!result.success) {
                return res.status(404).json({ message: result.message, data: null });
            }

            return res.status(200).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            console.error("Error in getConfigByUser:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getAllConfigs(req, res) {
        try {
            const result = await this.notificationConfigUsecase.getAllConfigs();

            if (!result.success) {
                return res.status(404).json({ message: result.message, data: null });
            }

            return res.status(200).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            console.error("Error in getAllConfigs:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async deleteConfig(req, res) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return res.status(400).json({ success: false, message: "Invalid configuration ID" });
            }

            const result = await this.notificationConfigUsecase.deleteConfig(id);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            console.error("Error in deleteConfig:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}

export default NotificationConfigController;
