import { isValidObjectId } from "mongoose";

import PushNotificationRepository from "../../../../infrastructure/repositories/chit/pushNotificationRepository.js";
import S3Service from "../../../../utils/s3Bucket.js";
import S3Repo from "../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js";
import CustomersRepository from "../../../../infrastructure/repositories/chit/CustomerRepository.js";
import FcmTokenRepository from "../../../../infrastructure/repositories/chit/fcmTokenRepository.js";
import TargetAudienceRepository from "../../../../infrastructure/repositories/chit/targetAudienceRepository.js";
import NotificationPromotionHistoryRepository from "../../../../infrastructure/repositories/chit/notifyPromotionHistory.js";
import smsService from "../../../../config/chit/smsService.js";
import TopupRepository from "../../../../infrastructure/repositories/chit/topupRepository.js";
import SmsSettingRepository from '../../../../infrastructure/repositories/chit/super/smsSettingRepository.js'
import config from "../../../../config/chit/env.js";


class NotifyUsecase {
  constructor() {
    this.pushNotificationRepo = new PushNotificationRepository();
    this.fcmTokenRepo = new FcmTokenRepository();
    this.s3Service = new S3Service();
    this.customerRepo = new CustomersRepository();
    // this.notificationRepository = new NotificationRepository();
    this.s3Repo = new S3Repo();
    // this.s3Repo = new S3Repo();
    this.targetAudienceRepo = new TargetAudienceRepository();
    this.notifyPromotionHistoryRepo =
      new NotificationPromotionHistoryRepository();
    this.topupRepo = new TopupRepository()
    this.smsRepo = new SmsSettingRepository()
  }

  addOneDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }

  async addNotification(data, files, token) {
    try {
      const {
        id_branch,
        id_scheme,
        customer_id,
        new_arrival_id,
        title,
        body,
        imageUrl,
      } = data;

      if (!id_branch || !Array.isArray(id_branch) || id_branch.length === 0) {
        return { success: false, message: "Branch ID(s) required as an array" };
      }

      // let customerData = await this.getCustomerData(id_scheme, customer_id, id_branch);
      // if (!customerData.length) {
      //     return { success: false, message: "No customers found for given criteria" };
      // }

      let customerData = await this.getCustomerData(
        id_scheme,
        customer_id,
        id_branch
      );

      customerData = Array.from(
        new Map(customerData.map((item) => [item._id, item])).values()
      );

      if (!customerData.length) {
        return { success: false, message: "No customers found" };
      }

      const notificationData = await this.prepareNotificationData(
        data,
        token,
        id_branch,
        id_scheme,
        new_arrival_id
      );
      const result = await this.pushNotificationRepo.addPushNotification(
        notificationData
      );

      if (!result) {
        return { success: false, message: "Push notification not saved" };
      }

      const imageUrlFinal = await this.handleImageUpload(
        files,
        imageUrl,
        token
      );
      await this.pushNotificationRepo.updatePushNotification(result._id, {
        image: imageUrlFinal,
      });

      const customerIds = customerData.map((e) => e._id); // !only unique values
      const fcmTokens = await this.fcmTokenRepo.getByCustomerIds(customerIds);

      await this.saveTargetAudience(result._id, customerIds, fcmTokens);

      if (fcmTokens) {
        await this.sendPushNotificationAndUpdate(
          result._id,
          fcmTokens,
          title,
          body,
          imageUrlFinal
        );
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

  // async addPromotion(data, files, token) {
  //     try {
  //         const { id_branch, id_scheme, customer_id, new_arrival_id, title, body, imageUrl, sms, email, whatsapp, pushNotification } = data;

  //         if (!id_branch || !Array.isArray(id_branch) || id_branch.length === 0) {
  //             return { success: false, message: "Branch ID(s) required as an array" };
  //         }

  //         // let customerData = await this.getCustomerData(id_scheme, customer_id, id_branch);
  //         // if (!customerData.length) {
  //         //     return { success: false, message: "No customers found for given criteria" };
  //         // }

  //         // let customerData = await this.getCustomerData(id_scheme, customer_id, id_branch);

  //         // const customers = Array.from(new Map(customer_id.map(item => [item._id, item])).values());

  //         if (!customer_id.length == 0) {
  //             return { success: false, message: "No customers selected" };
  //         }

  //         const promotionData = await this.prepareNotificationData(data, token, id_branch, id_scheme);
  //         const result = await this.pushNotificationRepo.addPromotion(promotionData);

  //         if (!result) {
  //             return { success: false, message: "Promotion not saved" };
  //         }

  //         const imageUrlFinal = await this.handleImageUpload(files, imageUrl, token);
  //         await this.pushNotificationRepo.updatePromotion(result._id, { image: imageUrlFinal });

  //         const customerIds = customerData.map((e) => e._id);

  //         const fcmTokens = pushNotification ? await this.fcmTokenRepo.getByCustomerIds(customerIds) : [];

  //         await this.saveTargetAudience(result._id, customerIds, fcmTokens);

  //         let pushCount = 0, smsCount = 0, whatsappCount = 0, emailCount = 0,
  //             pushFailCount, smsFailCount, whatsappFailCount, emailFailCount
  //             ;
  //         let pushNoficationResult, smsResult, whatsappResult, emailResult;

  //         if (pushNotification && fcmTokens.length > 0) {
  //             pushNoficationResult = await this.sendPushNotificationAndUpdate(result._id, fcmTokens, title, body, imageUrlFinal);

  //             pushCount = pushNoficationResult.successCount;
  //             pushFailCount = pushNoficationResult.failureCount;
  //         }

  //         if (sms) {
  //             //// todo - implement multiple number with 1 message

  //             // const smsResult = await sendSMS({ numbers: customerData.map(c => c.mobile).join("\n"), message: body, sms_type: "aurumm", type: "promotion" });
  //             // smsCount = smsResult.length;

  //             // todo - it's not better way for multi numbers --get unique numbers
  //             // smsCount = 0;
  //             // for (const customer of customerData) {
  //             //     if (customer.mobile) {
  //             //         const smsResult = await sendSMS({
  //             //             numbers: customer.mobile,
  //             //             message: body,
  //             //             sms_type: "aurumm",
  //             //             type: "promotion"
  //             //         });

  //             //         if (smsResult) {
  //             //             smsCount += 1;
  //             //         }
  //             //     }
  //             // }
  //         }
  //         // if(whatsapp){
  //         //          whatsappResult = await sendWhatsApp({
  //         //             smsType: "kavitha",
  //         //             numbers: customerData.map((c) => c.mobile).join("\n"),
  //         //             message: "kavitha_aupaypayment",
  //         //             imageUrl: imageUrl,
  //         //             customerName: "Customer Name",
  //         //             companyMobile: company.mobile,
  //         //             paymentId: id_payment,
  //         //             customerId: customer.id_customer,
  //         //         });

  //         // }
  //         // if (email) {
  //         // ! not needed for this release

  //         // }

  //         const updatedFinalResult = await this.pushNotificationRepo.updatePromotion(result._id, {
  //             status: 'sent',
  //             pushCount, smsCount, whatsappCount, emailCount,
  //             pushFailCount, smsFailCount, whatsappFailCount, emailFailCount

  //         });

  //         return { success: true, message: "Promotion added successfully", data: updatedFinalResult };
  //     } catch (error) {
  //         console.error(error);
  //         return { success: false, message: "Error while adding promotion" };
  //     }
  // }
  async addPromotion(data, files, token) {
    let result;

    try {
      const {
        id_branch,
        id_scheme,
        customer_id,
        title,
        body,
        pushNotification,
        sms,
        whatsapp,
        email,
        isHtml,
      } = data;

      if (!title || !body) {
        return { success: false, message: "Title and body are required" };
      }

      if (!id_branch || !Array.isArray(id_branch) || id_branch.length === 0) {
        return { success: false, message: "At least one branch is required" };
      }

      if (
        !customer_id ||
        !Array.isArray(customer_id) ||
        customer_id.length === 0
      ) {
        return { success: false, message: "At least one customer is required" };
      }

      // Fetch customer data including mobile numbers
      const customerData = await this.customerRepo.getCustomersByIds(
        customer_id,
        id_branch,
        {
          _id: 1,
          mobile: 1,
          whatsapp: 1,
        }
      );

      if (!customerData || customerData.length === 0) {
        return { success: false, message: "No valid customers found" };
      }

      // Prepare promotion data
      const promotionData = {
        title,
        body,
        isHtml: isHtml === "true",
        branchId: id_branch,
        schemeId: id_scheme || [],
        customerId: customer_id,
        pushNotification: pushNotification === "true",
        sms: sms === "true",
        whatsapp: whatsapp === "true",
        email: email === "true",
        createdBy: token.userId,
        status: "pending",
      };

      // Create promotion record
      result = await this.pushNotificationRepo.addPromotion(promotionData);

      if (!result) {
        return { success: false, message: "Promotion not saved" };
      }

      // Handle image upload if exists
      let imageUrlFinal = null;
      if (files && files.image) {
        imageUrlFinal = await this.handleImageUpload(files, null, token);
        await this.pushNotificationRepo.updatePromotion(result._id, {
          image: imageUrlFinal,
        });
      }

      // Initialize counters
      let pushCount = 0,
        smsCount = 0,
        whatsappCount = 0;
      let pushFailCount = 0,
        smsFailCount = 0,
        whatsappFailCount = 0;

      // Send push notifications if enabled
      if (pushNotification === "true") {
        const pushNotificationResult = await this.sendPushNotificationAndUpdate(
          result._id,
          customer_id,
          title,
          body,
          imageUrlFinal
        );

        pushCount = pushNotificationResult.successCount || 0;
        pushFailCount = pushNotificationResult.failureCount || 0;
      }

      //Send SMS
      if (sms === 'true') {
        const smsBalance = await this.topupRepo.getAllTopupBalance()
          if(smsBalance.SMS > 0){
            const validMobileNumbers = customerData
              .filter(c => c.mobile)
              .map(c => c.mobile);

          if (validMobileNumbers.length > 0) {
            const smsInfo = await this.smsRepo.findOne({
                promoSent: 1
              });
              if(smsInfo?.promoSent == 1){
                try {
                    const smsUrl = smsInfo?.common_url
                    let smsContent = smsInfo?.promoTemplate;
                    // smsContent = smsContent.replace(/{{otp}}/g, otp);

                    const smsResult = await smsService.sendNotification({
                        recipients: validMobileNumbers,
                        message: body,
                        type: "promotion",
                        channel:"sms"
                    });
  
                    smsCount = smsResult.successCount || 0;
                    smsFailCount = smsResult.failureCount || 0;
                } catch (smsError) {
                    console.error("SMS sending failed:", smsError);
                    smsFailCount = validMobileNumbers.length;
                }
              }
          }
          }else{
            return {status:false,message:"Insufficient SMS balance. Recharge to send promostions"}
          }
      }

      // Send WhatsApp if enabled
      if (whatsapp === 'true') {
          const validWhatsappNumbers = customerData
              .filter(c => c.mobile && this.isValidWhatsappNumber(c.mobile))
              .map(c => c.mobile);

          if (validWhatsappNumbers.length > 0) {
              try {
                  const whatsappResult = await this.whatsappService.sendBulkMessages({
                      numbers: validWhatsappNumbers,
                      message: body,
                      imageUrl: imageUrlFinal
                  });

                  whatsappCount = whatsappResult.successCount || 0;
                  whatsappFailCount = whatsappResult.failureCount || 0;
              } catch (whatsappError) {
                  console.error("WhatsApp sending failed:", whatsappError);
                  whatsappFailCount = validWhatsappNumbers.length;
              }
          }
      }

      // Update promotion with final status and counts
      const updatedFinalResult =
        await this.pushNotificationRepo.updatePromotion(result._id, {
          status: "sent",
          sentAt: new Date(),
        //   pushCount,
        //   smsCount,
        //   whatsappCount,
        //   pushFailCount,
        //   smsFailCount,
        //   whatsappFailCount
        });

      return {
        success: true,
        message: "Promotion added successfully",
        data: updatedFinalResult,
      };
    } catch (error) {
      console.error("Error in addPromotion:", error);
      if (result && result._id) {
        await this.pushNotificationRepo.updatePromotion(result._id, {
          status: "failed",
        });
      }

      return {
        success: false,
        message: "Error while adding promotion",
        error: error.message,
      };
    }
  }

  isValidWhatsappNumber(number) {
    return number.length >= 10;
  }

  // Helper functions
  async getCustomerData(id_scheme, customer_id, id_branch) {
    if (id_scheme && Array.isArray(id_scheme) && id_scheme.length > 0) {
      const customerIds = await this.customerRepo.getCustomerIdsBySchemeIds(
        id_scheme
      ); // todo - need to check

      return customerIds
        ? await this.customerRepo.getCustomersByIds(customerIds)
        : [];
    }
    if (customer_id && Array.isArray(customer_id) && customer_id.length > 0) {
      return await this.customerRepo.getCustomersByIds(customer_id);
    }
    return await this.customerRepo.getCustomersByBranch(id_branch);
  }

  async prepareNotificationData(data, token, id_branch, id_scheme) {
    return {
      ...data,
      createdBy: token.id_employee,
      updatedBy: token.id_employee,
      branchId: id_branch,
      schemeId: id_scheme,
      // newArraivalId: new_arrival_id,
    };
  }

  async handleImageUpload(files, imageUrl, token) {
    if (imageUrl) return imageUrl;
    if (files.image?.[0]) {
      const s3Settings = await this.s3Repo.getSetting();
      if (!s3Settings) throw new Error("S3 configuration not found");
      return await this.s3Service.uploadToS3(
        files.image[0],
        "notification",
        s3Settings
      );
    }
    return null;
  }

  async saveTargetAudience(notificationId, customerIds, fcmTokens) {
    await this.targetAudienceRepo.addTargetAudience({
      notificationId,
      promotionId: null,
      targetUsers: customerIds,
      fcmTokens,
    });
  }

  // async sendPushNotificationAndUpdate(notificationId, fcmTokens, title, body, imageUrl) {
  //     const pushResult = await sendPushNotification({
  //         tokens: fcmTokens.map((e) => e.token),
  //         title,
  //         body,
  //         imageUrl,
  //     });

  //     await this.pushNotificationRepo.updatePushNotification(notificationId, {
  //         status: 'sent',
  //         pushCount: pushResult.successCount,
  //         pushFailCount: pushResult.failureCount,
  //     });

  //     return pushResult;
  // }

  async sendPushNotificationAndUpdate(notificationId, customers, title, body, imageUrl) {
    if (!Array.isArray(customers) || customers.length === 0) {
      return { success: false, message: "No customers provided", successCount: 0, failureCount: 0 };
    }
  
    const CHUNK_SIZE = 500;
    let successCount = 0;
    let failureCount = 0;
  
    const tokenChunks = [];
  
    for (let i = 0; i < customers.length; i += CHUNK_SIZE) {
      tokenChunks.push(customers.slice(i, i + CHUNK_SIZE));
    }
  
    for (const chunk of tokenChunks) {
      try {
        const pushResult = await smsService.sendNotification({
        recipients: chunk,
        title,
        message: body,
        imageUrl: `https://aupay-img.s3.eu-north-1.amazonaws.com/${config.AWS_LOCAL_PATH}notification/${imageUrl}`,
        channel: "push",
        });

        successCount += pushResult.successCount || 0;
        failureCount += pushResult.failureCount || 0;
      } catch (err) {
        console.error("Push send error for chunk:", err);
        failureCount += chunk.length;
      }
    }
  
    // Update the DB with overall counts
    // await this.pushNotificationRepo.updatePushNotification(notificationId, {
    //   status: "sent",
    //   pushCount: successCount,
    //   pushFailCount: failureCount,
    // });
  
    return {
      success: true,
    //   successCount,
    //   failureCount,
    };
  }
  

  async getPushNotificationById(id) {
    if (!isValidObjectId(id))
      return { success: false, message: "Invalid object ID" };
    const notification =
      await this.pushNotificationRepo.getPushNotificationById(id);
    return notification
      ? {
          success: true,
          message: "Push notification fetched successfully",
          data: notification,
        }
      : { success: false, message: "Push notification not found" };
  }

  async deletePushNotification(id) {
    if (!isValidObjectId(id))
      return { success: false, message: "Invalid object ID" };
    const exists = await this.pushNotificationRepo.getPushNotificationById(id);
    if (!exists)
      return { success: false, message: "No push notification found" };

    const deleted = await this.pushNotificationRepo.deletePushNotification(id);
    return deleted
      ? { success: true, message: "Push notification deleted successfully" }
      : { success: false, message: "Failed to delete push notification" };
  }

  async pushnotificationTable({
    page = 1,
    limit = 10,
    from_date,
    to_date,
    id_branch,
    senttype,
    search,
  }) {
    try {
      const filter = { active: true };

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);

        if (isNaN(startDate) || isNaN(endDate)) {
          return { success: false, message: "Invalid date format" };
        }

        startDate.setUTCHours(0, 0, 0, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        filter.createdAt = { $gte: this.addOneDay(startDate), $lte: endDate };
      }

      // if (id_branch && mongoose.isValidObjectId(id_branch)) {
      //     filter.branchId = { $in: [new mongoose.Types.ObjectId(id_branch)] };
      // }

      // if (search) {
      //     const searchRegex = new RegExp(search, "i");

      //     filter.$or = [{ title: { $regex: searchRegex }, body: { $regex: searchRegex } }];
      // }

      const skip = (page - 1) * limit;
      const { data, totalCount } =
        await this.pushNotificationRepo.pushnotificationTable(
          filter,
          skip,
          parseInt(limit)
        );

      return {
        success: true,
        message: "Push notifications fetched successfully",
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching push notifications",
      };
    }
  }

  async promotionTable({
    page = 1,
    limit = 10,
    from_date,
    to_date,
    id_branch,
    senttype,
    search,
  }) {
    try {
      const filter = { active: true };

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);

        if (isNaN(startDate) || isNaN(endDate)) {
          return { success: false, message: "Invalid date format" };
        }

        startDate.setUTCHours(0, 0, 0, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        filter.createdAt = { $gte: this.addOneDay(startDate), $lte: endDate };
      }

      // if (id_branch && mongoose.isValidObjectId(id_branch)) {
      //     filter.branchId = { $in: [new mongoose.Types.ObjectId(id_branch)] };
      // }

      const skip = (page - 1) * limit;
      const { data, totalCount } =
        await this.pushNotificationRepo.promotionTable(
          filter,
          skip,
          parseInt(limit)
        );
      return {
        success: true,
        message: "Promotions fetched successfully",
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching push notifications",
      };
    }
  }

  async getSchemeCustomers({ id_scheme, page = 1, limit = 10 }) {
    try {
      const filter = { active: true };

      const skip = (page - 1) * limit;
      const { data, totalDocuments } =
        await this.pushNotificationRepo.getSchemeCustomers(
          id_scheme,
          filter,
          Number(skip),
          Number(limit)
        );
      return {
        success: true,
        message: "Promotions fetched successfully",
        data,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching push notifications",
      };
    }
  }
}

export default NotifyUsecase;
