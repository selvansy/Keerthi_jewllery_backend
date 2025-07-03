import FcmTokenModel from "../../models/chit/notify/fcmTokenModel.js";
import mongoose from "mongoose";

class FcmTokenRepository {
  async getAll() {
    try {
      const tokens = await FcmTokenModel.find({ active: true });
      return tokens.length ? tokens : null;
    } catch (error) {
      console.error("Error fetching FCM tokens:", error);
      return null;
    }
  }
  async getAllByDeviceType(deviceType) {
    try {
      const tokens = await FcmTokenModel.find({ active: true, deviceType });
      return tokens.length ? tokens : null;
    } catch (error) {
      console.error("Error fetching FCM tokens:", error);
      return null;
    }
  }

  async findByCustomerId(customerId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(customerId)) return null;
      const tokens = await FcmTokenModel.find({ customerId, active: true });
      return tokens.length ? tokens : null;
    } catch (error) {
      console.error("Error finding FCM tokens by customer ID:", error);
      return null;
    }
  }

  async deleteFcmTokenByCustomerId(customerId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(customerId)) return null;
      const result = await FcmTokenModel.updateMany(
        { customerId },
        { $set: { active: false } }
      );
      return result.modifiedCount > 0 ? result : null;
    } catch (error) {
      console.error("Error deactivating FCM tokens:", error);
      return null;
    }
  }

  async addFcmToken(data) {
    try {
      const newToken = await FcmTokenModel.create(data);
      return newToken;
    } catch (error) {
      console.error("Error adding FCM token:", error);
      return null;
    }
  }

  async getByCustomerIds(customerIds) {
    try {
      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        return null;
      }

      return await FcmTokenModel.find({
        customerId: { $in: customerIds.map(id => new mongoose.Types.ObjectId(id)) },
        active: true,
      });
    } catch (error) {
      console.error("Error fetching FCM tokens for multiple customers:", error);
      return null;
    }
  }

}

export default FcmTokenRepository;
