import promotionModel from "../../models/chit/notify/promotionModel.js";
import PromotionCustomer from '../../models/chit/notify/promotionCustomersModel.js'
import pushNotificationModel from "../../models/chit/notify/pushNotificationModel.js";
import mongoose from "mongoose";
import schemeAccountModel from "../../models/chit/schemeAccountModel.js";
 
class PushNotificationRepository { 
  
  async addPushNotification(data) { 
    try {
      const notification = new pushNotificationModel(data);
      return await notification.save();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePushNotification(id, updateData) {
    try {
      const updatedNotification = await pushNotificationModel.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { new: true }
      );

      return updatedNotification || null;
    } catch (error) {
      console.error("Error updating push notification:", error);
      throw error;
    }
  }
  async addPromotion(data) {
    try {
      const notification = new promotionModel(data);
      return await notification.save();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePromotion(id, updateData) {
    try {
      const updatedNotification = await promotionModel.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { new: true }
      );

      return updatedNotification || null;
    } catch (error) {
      console.error("Error updating push notification:", error);
      throw error;
    }
  }

  async getAllPushNotifications() {
    try {
      return await pushNotificationModel.find({ is_deleted: false,active:true });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPushNotificationById(id) {
    try {
      const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "branch",
          },
        },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch",
            foreignField: "id_branch",
            as: "bucketSettings",
          },
        },
        {
          $unwind: {
            path: "$bucketSettings",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            noti_name: 1,
            _id: 1,
            active: 1,
            total_sent: 1,
            noti_image: 1,
            senttype: 1,
            noti_desc: 1,
            branch_name: "$branch.branch_name",
            pathurl: {
              $concat: [
                "$bucketSettings.s3display_url",
                "webadmin/assets/img/pushnotification/",
              ],
            },
          },
        },
      ];

      const tableData = await pushNotificationModel.aggregate(pipeline);

      return tableData.length > 0 ? tableData[0] : null;
    } catch (error) {
      console.error(
        "Error in getPushNotificationById:",
        error.message,
        error.stack
      );
      throw new Error("Unable to fetch push notification. Please try again.");
    }
  }

  async deletePushNotification(id) {
    try {
      const deletedData = await pushNotificationModel.deleteOne({ _id: id });

      if (deletedData.deletedCount === 0) {
        return null;
      }

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateTotalSent(id, count) {
    try {
      const deletedData = await pushNotificationModel.updateOne(
        { _id: id },
        { $set: { total_sent: count } }
      );

      if (deletedData.modifiedCount === 0) {
        return null;
      }

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async  pushnotificationTable(query, skip, limit) {
    try {
        const totalCount = await pushNotificationModel.countDocuments(query);
        const data = await pushNotificationModel
            .find(query)
            .lean()
            .populate({
                path: "branchId",
                model: "Branch",
                select: "branch_name",
            })
            .populate({
                path: "schemeId", 
                model: "Scheme",
                select: "scheme_name",
            })
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 });

        const processedData = data.map(notification => ({
            ...notification,
            branchId: Array.isArray(notification.branchId)
                ? notification.branchId.map(branch => branch?.branch_name || "Unknown")
                : [],
            schemeId: notification.schemeId ? notification.schemeId.scheme_name : "Unknown",
        }));

        
        return { data: processedData || [], totalCount };
    } catch (error) {
        console.error("Error in getNotificationPromotionHistory:", error);
        throw error;
    }
}

  async promotionTable(query, skip, limit) {
    try {
      const totalCount = await promotionModel.countDocuments(query);

      const data = await promotionModel
        .find(query)
        .populate({
          path: "branchId",   
          model: "Branch",    
          select: "branch_name",
        })
        .populate({
          path: "schemeId",   
          model: "Scheme",    
          select: "scheme_name",
        })
        .populate({
          path: "customerId",   
          model: "Customer",    
          select: "firstname lastname mobile",
          
        })
       
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 });


      return { data: data || [], totalCount };
    } catch (error) {
      console.error("Error in promotion:", error);
      throw error;
    }
  }

  async getSchemeCustomers(schemeIds, filter = {}, skip = 0, limit = 10) {
    try {
      // Convert skip and limit to numbers
      skip = Number(skip) || 0;
      limit = Number(limit) || 10;
  
      const pipeline = [
        {
          $match: {
            id_scheme: { $in: schemeIds.map(id => new mongoose.Types.ObjectId(id)) },
            status: 0,
            ...filter.schemeAccountFilter
          }
        },
        {
          $group: {
            _id: "$id_customer"
          }
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer"
          }
        },
        {
          $unwind: "$customer"
        },
        ...(filter.customerFilter ? [{
          $match: {
            "customer": { ...filter.customerFilter }
          }
        }] : []),
        {
          $replaceRoot: {
            newRoot: "$customer"
          }
        },
        {
          $project: {
            _id: 1,
            firstname: 1,
            mobile: 1
          }
        },
        { $skip: skip },
        { $limit: limit }        
      ];

      const countPipeline = [
        ...pipeline.slice(0, -2)
      ];
  
      const [results, totalCount] = await Promise.all([
        schemeAccountModel.aggregate(pipeline),
        schemeAccountModel.aggregate([...countPipeline, { $count: "total" }])
      ]);

      return {
        data: results,
        totalDocuments: totalCount[0]?.total || 0,
        skip,
        limit
      };
    } catch (error) {
      console.error("Error in getCustomersWithSchemes:", error);
      throw error;
    }
  }

}

export default PushNotificationRepository;