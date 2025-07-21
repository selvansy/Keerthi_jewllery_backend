import cron from "node-cron";
import PushNotification from "../models/PushNotification.js";
import { processPushNotification } from "../services/notificationService.js";

cron.schedule("* * * * *", async () => {

  const now = new Date();
  const notifications = await PushNotification.find({
    status: "pending",
    scheduledAt: { $lte: now },
  });

  for (const notification of notifications) {
    await processPushNotification(notification._id);
  }
});