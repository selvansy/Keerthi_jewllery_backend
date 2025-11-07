import cron from "node-cron";
import dotenv from "dotenv";

import Customer from "../../infrastructure/models/chit/customerModel.js";
import MessageQueue from "../../infrastructure/models/chit/messageQueueModel.js";
import smsService from "./smsService.js";

dotenv.config();

const TIMEZONE = "Asia/Kolkata";


const PREPARE_CRON = "0 2 * * *";
// const PREPARE_CRON = "8 14 * * *";
const SEND_CRON = "0 8 * * *";

const CUSTOMER_BATCH = 500;
const SEND_BATCH = 50;


class NotificationScheduler {
  constructor() {
    this.initialize();
  }

  initialize() {
    cron.schedule(PREPARE_CRON, this.prepareMessages.bind(this), { timezone: TIMEZONE });
    cron.schedule(SEND_CRON, this.sendMessages.bind(this), { timezone: TIMEZONE });

    console.log("✅ Scheduler Started");
  }

  // ✅ Cron #1 → Runs at 2 AM
  async prepareMessages() {
    console.log("⏳ [2 AM] Preparing messages...");

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    try {
      const cursor = Customer.find({
        active: true,
        is_deleted: false,
        $or: [
          { date_of_birth: { $exists: true } },
          { date_of_wed: { $exists: true } }
        ]
      })
        .lean()
        .cursor();

      let customersBatch = [];

      for (let customer = await cursor.next(); customer != null; customer = await cursor.next()) {
        customersBatch.push(customer);

        if (customersBatch.length >= CUSTOMER_BATCH) {
          await this.processCustomerBatch(customersBatch, month, day);
          customersBatch = [];
        }
      }

      if (customersBatch.length > 0) {
        await this.processCustomerBatch(customersBatch, month, day);
      }

      console.log("✅ Finished preparing notifications");

    } catch (err) {
      console.error("❌ Error preparing messages:", err);
    }
  }

  async processCustomerBatch(batch, month, day) {
    let queueEntries = [];

    for (const c of batch) {
      if (
        c.date_of_birth &&
        new Date(c.date_of_birth).getMonth() + 1 === month &&
        new Date(c.date_of_birth).getDate() === day
      ) {
        console.log(c)
        queueEntries.push({
          insertOne: {
            document: {
              customerId: c._id,
              mobile: c.mobile?.toString(),
              name: c.firstname,
              messageType: 1,
              message: `Happy Birthday ${c.firstname}! 🎉`,
              cronStatus: 1,
              sendStatus: 2,
              scheduledAt: this.getTodayAt8AM()
            }
          }
        });
      }

      if (
        c.date_of_wed &&
        new Date(c.date_of_wed).getMonth() + 1 === month &&
        new Date(c.date_of_wed).getDate() === day
      ) {
        queueEntries.push({
          insertOne: {
            document: {
              customerId: c._id,
              mobile: c.mobile?.toString(),
              name: c.firstname,
              messageType: 2,
              message: `Happy Wedding Anniversary ${c.firstname}! 💖`,
              cronStatus: 1,
              sendStatus: 2,
              scheduledAt: this.getTodayAt8AM()
            }
          }
        });
      }
    }

    if (queueEntries.length > 0) {
      await MessageQueue.bulkWrite(queueEntries);
      console.log(`✅ Saved ${queueEntries.length} messages to queue`);
    }
  }


  getTodayAt8AM() {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  }

  async sendMessages() {
    console.log("📤 [8 AM] Sending queued notifications...");

    try {
      let skip = 0;

      while (true) {
        const batch = await MessageQueue.find({
          sendStatus: 2,
          scheduledAt: { $lte: new Date() }
        })
          .limit(SEND_BATCH)
          .skip(skip);

        if (batch.length === 0) break;

        await Promise.all(batch.map(async (msg) => {
          try {

            const input ={
              recipients: [msg.customerId],
             title: "" ,
             message: msg.message,
             channel: "push",
            }

            await smsService.sendNotification(input);

            await MessageQueue.findByIdAndUpdate(msg._id, {
              sendStatus: 1,
              sentAt: new Date()
            });

          } catch (err) {
            console.error("❌ SMS failed:", msg.mobile, err.message);
          }
        }));

        skip += SEND_BATCH;
        console.log(`✅ Sent batch of ${batch.length}`);
      }

      console.log("✅ All queued messages processed");

    } catch (err) {
      console.error("❌ Error sending notifications:", err);
    }
  }
}

new NotificationScheduler();