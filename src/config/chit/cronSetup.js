import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
import Customer from '../../infrastructure/models/chit/customerModel.js';
// import Notification from '../../infrastructure/models/chit/notificationUserStatusModel.js';
import NotificationConfig from '../../infrastructure/models/chit/notificationConfigModel.js';
import smsService from './smsService.js';

dotenv.config();

const TIMEZONE = 'Asia/Kolkata';
const PREPARATION_TIME = '02 23 * * *';
const NOTIFICATION_TIME = '06 11 * * *';

class NotificationScheduler {
  constructor() {
    this.notificationConfig = null;
    this.initialize();
  }

  async initialize() {
    try {
      this.notificationConfig = await NotificationConfig.findOne({ active: true });
      // if (!this.notificationConfig) {
      //   throw new Error('No active notification configuration found');
      // }
      
      this.setupCronJobs();
      console.log('✅ Notification scheduler initialized');
    } catch (error) {
      console.error('❌ Failed to initialize scheduler:', error);
      process.exit(1);
    }
  }

  setupCronJobs() {
    cron.schedule(PREPARATION_TIME, this.prepareDailyNotifications.bind(this), {
      scheduled: true,
      timezone: TIMEZONE
    });

    cron.schedule(NOTIFICATION_TIME, this.sendScheduledNotifications.bind(this), {
      scheduled: true,
      timezone: TIMEZONE
    });

    console.log(`⏰ Cron jobs set up:
    - Preparation: ${PREPARATION_TIME} (12:00 AM)
    - Notifications: ${NOTIFICATION_TIME} (8:00 AM)`);
  }

  async prepareDailyNotifications() {
    console.log('[12:00 AM] Starting daily notification preparation');
    try {
      this.notificationConfig = await NotificationConfig.findOne({ active: true });
      if (!this.notificationConfig) {
        console.log('ℹ️ No active notification configuration found');
        return;
      }

      const wishesEnabled = this.isAnyWishNotificationEnabled();
      if (!wishesEnabled) {
        console.log('ℹ️ All wish notifications are disabled in configuration');
        return;
      }

      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const allCustomers = await Customer.find({
        active: true,
        is_deleted: false,
        $or: [
          { date_of_birth: { $exists: true, $ne: null } },
          { date_of_wed: { $exists: true, $ne: null } }
        ]
      }).lean();

      if (allCustomers.length === 0) {
        console.log('ℹ️ No active customers found');
        return;
      }

      const customers = allCustomers.filter(customer => {
        const hasBirthday = customer.date_of_birth &&
          new Date(customer.date_of_birth).getMonth() + 1 === month &&
          new Date(customer.date_of_birth).getDate() === day;

        const hasAnniversary = customer.date_of_wed &&
          new Date(customer.date_of_wed).getMonth() + 1 === month &&
          new Date(customer.date_of_wed).getDate() === day;

        return hasBirthday || hasAnniversary;
      });

      if (customers.length === 0) {
        console.log('ℹ️ No customers with events today');
        return;
      }

      console.log(`📋 Found ${customers.length} customers with events today`);

      const notificationPromises = customers.map(customer =>
        this.prepareCustomerNotifications(customer, month, day)
      );

      await Promise.all(notificationPromises);
      console.log('✅ Completed notification preparation');
    } catch (error) {
      console.error('❌ Error in notification preparation:', error);
    }
  }

  isAnyWishNotificationEnabled() {
    const { pushNotification, sms, whatsapp, email } = this.notificationConfig;
    
    return (
      (pushNotification.enabled && pushNotification.settings.wishes.birthday) ||
      (pushNotification.enabled && pushNotification.settings.wishes.weddingAnniversary) ||
      (sms.enabled && sms.settings.wishes.birthday) ||
      (sms.enabled && sms.settings.wishes.weddingAnniversary) ||
      (whatsapp.enabled && whatsapp.settings.wishes.birthday) ||
      (whatsapp.enabled && whatsapp.settings.wishes.weddingAnniversary) ||
      (email.enabled && email.settings.wishes.birthday) ||
      (email.enabled && email.settings.wishes.weddingAnniversary)
    );
  }

  isNotificationEnabled(channel, type) {
    if (!this.notificationConfig[channel]?.enabled) {
      return false;
    }
    
    const notificationType = type === 'birthday' ? 'birthday' : 'weddingAnniversary';
    return this.notificationConfig[channel].settings.wishes[notificationType];
  }

  async prepareCustomerNotifications(customer, month, day) {
    const { firstname, mobile, fcmToken, email } = customer;
    const mobileString = mobile ? mobile.toString() : null;

    const notificationTypes = [];

    if (customer.date_of_birth) {
      const birthDate = new Date(customer.date_of_birth);
      if (birthDate.getMonth() + 1 === month && birthDate.getDate() === day) {
        notificationTypes.push('birthday');
      }
    }

    if (customer.date_of_wed) {
      const weddingDate = new Date(customer.date_of_wed);
      if (weddingDate.getMonth() + 1 === month && weddingDate.getDate() === day) {
        notificationTypes.push('wedding');
      }
    }

    for (const type of notificationTypes) {
      const greeting = type === 'birthday' ? 'Happy Birthday' : 'Happy Anniversary';
      const messageText = `Dear ${firstname}, ${greeting}! 🎉`;
      const notificationType = type === 'birthday' ? 'birthday' : 'weddingAnniversary';

      if (mobileString && this.isNotificationEnabled('sms', type)) {
        await this.saveNotification({
          channel: 'sms',
          recipients: [mobileString],
          message: messageText,
          type: notificationType,
          customerId: customer._id,
          scheduledTime: '08:00'
        });
      }

      if (fcmToken && this.isNotificationEnabled('pushNotification', type)) {
        await this.saveNotification({
          channel: 'push',
          recipients: [fcmToken],
          message: messageText,
          type: notificationType,
          customerId: customer._id,
          scheduledTime: '08:00'
        });
      }

      if (mobileString && this.isNotificationEnabled('whatsapp', type)) {
        await this.saveNotification({
          channel: 'whatsapp',
          recipients: [mobileString],
          message: messageText,
          type: notificationType,
          customerId: customer._id,
          scheduledTime: '08:00'
        });
      }

      if (email && this.isNotificationEnabled('email', type)) {
        await this.saveNotification({
          channel: 'email',
          recipients: [email],
          message: messageText,
          type: notificationType,
          customerId: customer._id,
          scheduledTime: '08:00'
        });
      }

      console.log(`⏳ Prepared ${type} notification for ${firstname}`);
    }
  }

  async saveNotification(notification) {
    try {
      await Notification.create({
        fname: notification.fname,
        lname: notification.lname,
        mobile: notification.channel === 'sms' || notification.channel === 'whatsapp' ? notification.recipients[0] : null,
        email: notification.channel === 'email' ? notification.recipients[0] : null,
        fcmToken: notification.channel === 'push' ? notification.recipients[0] : null,
        type: notification.type,
        scheduledFor: this.getTodayAt8AM(),
        sent: false,
        retries: 0,
        lastAttemptAt: null,
        channel: notification.channel,
        message: notification.message // Ensure message is saved
      });
    } catch (error) {
      console.error('❌ Failed to save notification:', error);
      throw error;
    }
  }
  
  getTodayAt8AM() {
    const now = new Date();
    now.setHours(8, 0, 0, 0);
    return now;
  }

  async sendScheduledNotifications() {
    console.log('[8:00 AM] Starting notification sending process');
    try {
      const notifications = await Notification.find({
        sent: false,
        scheduledFor: { $lte: new Date() },
      });

      if (notifications.length === 0) {
        console.log('ℹ️ No scheduled notifications found');
        return;
      }

      console.log(`📨 Found ${notifications.length} notifications to send`);

      const sendResults = await Promise.allSettled(
        notifications.map(notification => this.sendSingleNotification(notification))
      );

      const successful = sendResults.filter(r => r.status === 'fulfilled').length;
      const failed = sendResults.filter(r => r.status === 'rejected').length;

      console.log(`✅ Notification sending completed:
      - Successful: ${successful}
      - Failed: ${failed}`);
    } catch (error) {
      console.error('❌ Error in notification sending:', error);
    }
  }

  async sendSingleNotification(notification) {
    try {
      if (!this.isNotificationEnabled(notification.channel, notification.type)) {
        console.log(`ℹ️ Notification ${notification._id} is no longer enabled, skipping`);
        await Notification.findByIdAndUpdate(notification._id, {
          sent: true,
          status: 'disabled'
        });
        return { success: true, notificationId: notification._id, status: 'disabled' };
      }

      // Ensure we have a message
      const message = notification.message || 
                     (notification.type === 'birthday' 
                       ? 'Happy Birthday! 🎉' 
                       : 'Happy Anniversary! 💖');

      await smsService.sendNotification({
        channel: notification.channel,
        recipients: [notification.mobile || notification.email || notification.fcmToken],
        message: message,
        type: notification.type
      });

      await Notification.findByIdAndUpdate(notification._id, {
        sent: true,
        sentAt: new Date(),
        status: 'sent'
      });

      console.log(`✉️ Sent ${notification.type} notification via ${notification.channel}`);
      return { success: true, notificationId: notification._id };
    } catch (error) {
      await Notification.findByIdAndUpdate(notification._id, {
        status: 'failed',
        error: error.message,
        lastAttemptAt: new Date(),
        $inc: { retries: 1 }
      });
      console.error(`❌ Failed to send notification ${notification._id}:`, error.message);
      throw error;
    }
  }
}

new NotificationScheduler();