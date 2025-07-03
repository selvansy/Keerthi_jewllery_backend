import { Error, isValidObjectId } from "mongoose";
import axios from "axios";
import mongoose from "mongoose";
 

class PushNotificationUseCase {
  constructor(
    pushNotificationRepo,
    s3Service,
    customersRepository,
    notificationRepository,
    s3Respo
  ) {
    this.pushNotificationRepo = pushNotificationRepo;
    this.s3Service = s3Service;
    this.customersRepository = customersRepository;
    this.notificationRepository = notificationRepository;
    this.s3Respo = s3Respo;
  }

  sendToOneSignal = async (fields, authorization) => {
    try {
      const response = await axios.post('https://onesignal.com/api/v1/notifications', fields, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Basic ${authorization}`
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Error sending notification to OneSignal', error);
      throw new Error('Error sending notification to OneSignal');
    }
  };

  async addPushNotification(data, files) {
    try {
      const { noti_name, noti_desc, senttype, id_branch } = data;

      const notifysetting =
        await this.notificationRepository.getNotificaitonSettings(id_branch);

        if(notifysetting.notify_sent !== 1){
          return {success:false,message:"Notificatin is not enabled"}
      }

      const customers = await this.customersRepository.find({
        id_branch: id_branch,
        active: true,
      });

      let total_sent = 0;
      if (customers.length === 0) {
        return { success: false, message: "No active customers found" };
      }

      const s3settings = await this.s3Respo.getSettingByBranch(id_branch);

      if (!s3settings) {
        return { success: false, message: "S3 configuration not found" };
      }

      const configuration = {
        s3key: s3settings[0].s3key,
        s3secret: s3settings[0].s3secret,
        s3bucket_name: s3settings[0].s3bucket_name,
        s3display_url: s3settings[0].s3display_url,
        region: s3settings[0].region,
      };

      try {
        if (files.noti_image[0]) {
          data.noti_image = await this.s3Service.uploadToS3(
            files.noti_image[0],
            "pushnotification",
            configuration
          );
        }
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Image upload failed, try again later",
        };
      }

      const result = await this.pushNotificationRepo.addPushNotification(data);

      for (let val of customers) {
          const notifyContent = {
            en: noti_desc,
          };

          const headings = {
            en: noti_name,
          };

          const notifyImage = `${configuration.s3display_url}webadmin/assets/pushnotificaiton/${result.noti_image}`;

          const iosImage = {
            id1: notifyImage,
          };

          if (val.subscription_id != "") {
            const fields = {
              app_id: notifysetting.notifyappid,
              include_player_ids: [val.subscription_id],
              data: { foo: "bar" },
              contents: notifyContent,
              headings: headings,
              ios_attachments: iosImage,
              small_icon: notifyImage,
              large_icon: notifyImage,
              big_picture: notifyImage,
            };

            const sentresponse = await this.sendToOneSignal(
              fields,
              notifysetting.notifyauthirization
            );

            total_sent = total_sent + 1;
          }
      }
      const updateTotalSent  = await this.pushNotificationRepo.updateTotalSent(result._id,total_sent)

      if(!updateTotalSent){
        throw new Error("Error while updating notification count")
      }
      return {
        success: true,
        message: "Push notification added successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while adding push notification",
      };
    }
  }

  async getAllPushNotifications() {
    try {
      const notifications =
        await this.pushNotificationRepo.getAllPushNotifications();
      return { success: true, data: notifications };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching push notifications",
      };
    }
  }

  async getPushNotificationById(id) {
    try {
      if (!isValidObjectId(id)) {
        return {
          success: false,
          message: "Provided id is not a valid object id",
        };
      }

      const notification =
        await this.pushNotificationRepo.getPushNotificationById(id);

      if (!notification) {
        return { success: false, message: "Push notification not found" };
      }

      return {
        success: true,
        message: "Pushnotification data fetched successfully",
        data: notification,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching push notification",
      };
    }
  }

  async deletePushNotification(id) {
    try {
      if (!isValidObjectId(id)) {
        return {
          success: false,
          message: "Provided id is not a valid object id",
        };
      }
      const exists = await this.pushNotificationRepo.getPushNotificationById(
        id
      );

      if (!exists) {
        return { success: false, message: "No push notification found" };
      }

      // if (exists.is_deleted) {
      //   return { success: false, message: "Already deleted push notification" };
      // }

      const deleted = await this.pushNotificationRepo.deletePushNotification(
        id
      );

      if (!deleted) {
        return {
          success: false,
          message: "Failed to delete push notification",
        };
      }

      return {
        success: true,
        message: "Push notification deleted successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while deleting push notification",
      };
    }
  }

  async getWeddingBirthday(type) {
    try {
      const notification = await this.pushNotificationRepo.getWeddingBirthday(
        type
      );

      if (!notification) {
        return { success: false, message: "Push notification not found" };
      }

      return {
        success: true,
        message: "Pushnotification data fetched successfully",
        data: notification,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching push notification",
      };
    }
  }

  async pushnotificationTable(data) {
    try {
      const {
        page = 1,
        limit = 10,
        from_date,
        to_date,
        id_branch,
        senttype,
        search,
      } = data;

      let filter = { is_deleted: false };
      const skip = (page - 1) * limit;
      const limitInt = parseInt(limit);
      // if (from_date && to_date) {
      //   const startDate = new Date(from_date);
      //   const endDate = new Date(to_date);

      //   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      //     return res.status(400).json({ message: "Invalid date format" });
      //   }

      //   filter.createdAt = {
      //     $gte: startDate,
      //     $lte: endDate,
      //   };
      // }

      // if (isValidObjectId(id_branch)) {
      //   filter.id_branch = new mongoose.Types.ObjectId(id_branch);
      // }

      // if (senttype) {
      //   filter.senttype = senttype;
      // }

      if (search) {
        const searchRegex = new RegExp(search, "i");

        filter.$or = [{ title: { $regex: searchRegex }, body: { $regex: searchRegex } }];
      }

      const notification =
        await this.pushNotificationRepo.pushnotificationTable(filter,skip,limit);

      if (!notification) {
        return { success: false, message: "Push notification not found" };
      }

      return {
        success: true,
        message: "Pushnotification data fetched successfully",
        data: notification.data,
        totalCount: notification.totalCount,
        totalPages: Math.ceil(notification.totalCount / limitInt),
        currentPage: page,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching push notification",
      };
    }
  }
}

export default PushNotificationUseCase;
