class SaveNotificationController {
    constructor(savedNotificationUsecase) {
        this.savedNotificationUsecase = savedNotificationUsecase;
    }

    async getUserNotifications(req, res) {
        try {
            const userId = req.user._id

            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }

            const result = await this.savedNotificationUsecase.getUserNotifications(userId);

            if (result.success) {
                return res.status(200).json(result);
            }

            return res.status(404).json(result);
        } catch (error) {
            console.error("Error in getUserNotifications:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async updateNotificationStatus(req, res) {
        try {
            const { notificationId} = req.body;
            const userId = req.user._id

            if (!notificationId || !userId ) {
                return res.status(400).json({ success: false, message: "notificationId, userId  are required" });
            }

            const result = await this.savedNotificationUsecase.updateNotificationStatus(notificationId, userId);

            if (result.success) {
                return res.status(200).json({message:result.message});
            }

            return res.status(400).json(result);
        } catch (error) {
            console.error("Error in updateNotificationStatus:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async clearAllNotification(req, res) {
        try {
            const userId = req.user._id

            if (!userId ) {
                return res.status(400).json({ success: false, message: "userId  are required" });
            }

            const result = await this.savedNotificationUsecase.clearAllNotification(userId);

            if (result.success) {
                return res.status(200).json({message:result.message});
            }

            return res.status(400).json(result);
        } catch (error) {
            console.error("Error in updateNotificationStatus:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async notificationCount(req, res) {
        try {
            const userId = req.user._id

            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }

            const result = await this.savedNotificationUsecase.notificationCount(userId);

            if (result.success) {
                return res.status(200).json(result);
            }

            return res.status(404).json(result);
        } catch (error) {
            console.error("Error in getUserNotifications:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async readAllNotification(req, res) {
        try {
            const userId = req.user._id

            if (!userId ) {
                return res.status(400).json({ success: false, message: "userId  are required" });
            }

            const result = await this.savedNotificationUsecase.readAllNotification(userId);

            if (result.success) {
                return res.status(200).json({message:result.message});
            }

            return res.status(400).json(result);
        } catch (error) {
            console.error("Error in updateNotificationStatus:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}

export default SaveNotificationController;
