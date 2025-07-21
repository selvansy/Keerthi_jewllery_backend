class SaveNotificationUsecase {
    constructor(savenotificaitonRepo) {
        this.savenotificaitonRepo = savenotificaitonRepo;
    }

    async saveNotification(data,userData) {
        try {
            const savedNotification = await this.savenotificaitonRepo.saveNotification(data);

            if(savedNotification){
                const inputData ={
                    notification_id: savedNotification?._id,
                    user_id: userData
                }

                const notificationStatus = await this.savenotificaitonRepo.saveNotificationStatus(inputData)
                if(notificationStatus){
                    return true
                }
            }
            
            return false
        } catch (error) {
            console.error(error);
            return { success: false, message: "Internal server error" };
        }
    }

    async getUserNotifications(userId) {
        try {
            const notifications = await this.savenotificaitonRepo.getUserNotifications(userId);

            return { success: true, data: notifications };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Failed to fetch notifications" };
        }
    }

    async updateNotificationStatus(notificationId, userId) {
        try {
            const updated = await this.savenotificaitonRepo.updateNotificationStatus(notificationId, userId);

            if (updated) {
                return { success: true, message: "Notification status updated"};
            }

            return { success: false, message: "Notification not found or not updated" };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Failed to update status" };
        }
    }

    async clearAllNotification(userId) {
        try {
            const updated = await this.savenotificaitonRepo.clearAllNotification(userId);

            if (updated) {
                return { success: true, message: "Notification status updated"};
            }

            return { success: false, message: "Notification not found or not updated" };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Failed to update status" };
        }
    }

    async notificationCount(userId) {
        try {
            const notifications = await this.savenotificaitonRepo.notificationCount(userId);
            const output = {}

            if(notifications.length > 0){
                output.count = notifications.length
            }else{
                output.count = 0
            }
            return { success: true, data: output };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Failed to fetch notifications" };
        }
    }

    async readAllNotification(userId) {
        try {
            const updated = await this.savenotificaitonRepo.readAllNotification(userId);

            if (updated) {
                return { success: true, message: "Notification status updated"};
            }

            return { success: false, message: "Notification not found or not updated" };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Failed to update status" };
        }
    }
}

export default SaveNotificationUsecase;
