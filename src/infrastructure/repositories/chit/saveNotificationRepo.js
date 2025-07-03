import { Notification, NotificationUserStatus } from "../../models/chit/notificationUserStatusModel.js";

class SaveNotificationRepo {
    async saveNotification(data) {
        try {
            const savedData = await Notification.create(data);
            if (!savedData) return null;
            return savedData;
        } catch (error) {
            console.error(error);
            throw new Error("Error while saving notification");
        }
    }

    async saveNotificationStatus(data) {
        try {
            const savedData = await NotificationUserStatus.create(data);
            if (!savedData) return null;
            return savedData;
        } catch (error) {
            console.error(error);
            throw new Error("Error while saving notification");
        }
    }

    async getUserNotifications(userId) {
        try {
            const userNotifications = await NotificationUserStatus.find({ user_id: userId,status: { $in: [0, 2] }})
                .populate({
                    path: 'notification_id',
                    select: 'title message type category image'
                })
                .select('-status_changes')
                .sort({ createdAt: -1 })
                .limit(20)
            return userNotifications;
        } catch (error) {
            console.error(error);
            throw new Error("Error while fetching user notifications");
        }
    }
    

    async updateNotificationStatus(notificationId, userId) {
        try {
            const statusUpdate = await NotificationUserStatus.findOneAndUpdate(
                { notification_id: notificationId, user_id: userId },
                {
                    $set: { status: 1 },
                },
                { new: true }
            );
            return statusUpdate;
        } catch (error) {
            console.error(error);
            throw new Error("Error while updating notification status");
        }
    }

    async clearAllNotification(userId) {
        try {
            const notifications = await NotificationUserStatus.find({
                user_id: userId,
                status:{ $in: [0, 2] }
            })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('_id');
    
            const idsToUpdate = notifications.map(doc => doc._id);
    
            if (idsToUpdate.length === 0) return { message: "No notifications to update" };
    
            const statusUpdate = await NotificationUserStatus.updateMany(
                { _id: { $in: idsToUpdate } },
                { $set: { status: 1 } }
            );
    
            return statusUpdate;
        } catch (error) {
            console.error(error);
            throw new Error("Error while updating notification status");
        }
    }

    async notificationCount(userId) {
        try {
            const userNotifications = await NotificationUserStatus.find({ user_id: userId,status:0})
                .populate({
                    path: 'notification_id',
                    select: 'title message type category image'
                })
                .select('-status_changes')
                .sort({ createdAt: -1 })
                .limit(20)
            return userNotifications;
        } catch (error) {
            console.error(error);
            throw new Error("Error while fetching user notifications");
        }
    }

    async readAllNotification(userId) {
        try {
            const notifications = await NotificationUserStatus.find({
                user_id: userId,
                status: 0
            })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('_id');
    
            const idsToUpdate = notifications.map(doc => doc._id);
    
            if (idsToUpdate.length === 0) return { message: "No notifications to update" };
    
            const statusUpdate = await NotificationUserStatus.updateMany(
                { _id: { $in: idsToUpdate } },
                { $set: { status: 2 } }
            );
    
            return statusUpdate;
        } catch (error) {
            console.error(error);
            throw new Error("Error while updating notification status");
        }
    }
    
}

export default SaveNotificationRepo;