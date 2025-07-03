import NotificationPromotionHistoryModel from "../../models/chit/notify/notificationPromotionHistoryModel.js";
import mongoose from "mongoose";

class NotificationPromotionHistoryRepository {
    
    async getAll({ query = {}, documentskip = 0, documentlimit = 10 }) {
        try {
            const totalCount = await NotificationPromotionHistoryModel.countDocuments(query);
            const data = await NotificationPromotionHistoryModel.find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .sort({ createdAt: -1 });

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error fetching notification/promotion history:", error);
            return null;
        }
    }

    async findByUserId(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) return null;
            return await NotificationPromotionHistoryModel.find({ userId });
        } catch (error) {
            console.error("Error finding notification history by user ID:", error);
            return null;
        }
    }

    async findByBranchProductCategory(branchId, productId, categoryId) {
        try {
            const filter = {};
            if (branchId) filter.branchId = branchId;
            if (productId) filter.productId = productId;
            if (categoryId) filter.categoryId = categoryId;

            return await NotificationPromotionHistoryModel.find(filter);
        } catch (error) {
            console.error("Error fetching notification history by filters:", error);
            return null;
        }
    }

    async addHistory(data) {
        try {
            return await NotificationPromotionHistoryModel.create(data);
        } catch (error) {
            console.error("Error adding notification history:", error);
            return null;
        }
    }

    async updateStatus(referenceId, userId, status, errorMessage = "") {
        try {
            return await NotificationPromotionHistoryModel.updateOne(
                { referenceId, userId },
                { $set: { status, errorMessage, sentAt: new Date() } }
            );
        } catch (error) {
            console.error("Error updating notification status:", error);
            return null;
        }
    }
}

export default NotificationPromotionHistoryRepository;
