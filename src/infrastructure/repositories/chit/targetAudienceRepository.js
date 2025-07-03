import TargetAudienceModel from "../../models/chit/notify/targetAudienceModel.js";
import mongoose from "mongoose";

class TargetAudienceRepository {

    async getAll({ query = {}, documentskip = 0, documentlimit = 10 }) {
        try {
            const totalCount = await TargetAudienceModel.countDocuments(query);
            const data = await TargetAudienceModel.find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .sort({ createdAt: -1 });

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error fetching target audience:", error);
            return null;
        }
    }

    async findByNotificationId(notificationId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(notificationId)) return null;
            return await TargetAudienceModel.find({ notificationId });
        } catch (error) {
            console.error("Error finding target audience by notification ID:", error);
            return null;
        }
    }

    async findByPromotionId(promotionId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(promotionId)) return null;
            return await TargetAudienceModel.find({ promotionId });
        } catch (error) {
            console.error("Error finding target audience by promotion ID:", error);
            return null;
        }
    }

    async addTargetAudience(data) {
        try {
            return await TargetAudienceModel.create(data);
        } catch (error) {
            console.error("Error adding target audience:", error);
            return null;
        }
    }

    async updateFcmTokens(notificationId, fcmTokens) {
        try {
            return await TargetAudienceModel.updateOne(
                { notificationId },
                { $set: { fcmTokens } }
            );
        } catch (error) {
            console.error("Error updating FCM tokens for target audience:", error);
            return null;
        }
    }
}

export default TargetAudienceRepository;
