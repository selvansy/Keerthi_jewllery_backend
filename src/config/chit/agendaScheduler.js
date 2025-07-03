// import Agenda from 'agenda';
// import mongoose from 'mongoose';
// import smsService from './smsService.js';
// import connectDB from './database.js';

// await connectDB();
// console.log('✅ MongoDB connected');

// // Agenda Configuration
// const agenda = new Agenda({
//     mongo: mongoose.connection,
//     db: { collection: 'scheduled_notifications' },
//     defaultConcurrency: 5,
//     processEvery: '5 seconds',
//     maxConcurrency: 10,
//     lockLimit: 10, // Must be >0
//     defaultLockLifetime: 30000 // Match job definition
//   });

// console.log('🛠️ Agenda initialized');

// // Define job processor - SIMPLIFIED AND FIXED VERSION
// agenda.define('send notification', { lockLifetime: 30000, lockLimit: 5, concurrency: 5 }, async (job) => {
//   console.log('🔔 Job processor triggered');
//   try {
//     const { type, payload } = job.attrs.data;
//     console.log(`Processing ${type} notification`, payload);

//     if (!type || !payload) {
//       throw new Error('Missing type or payload in job data');
//     }

//     if (type === 'sms') {
//       if (!payload.mobile || !payload.message) {
//         throw new Error('Missing mobile or message in SMS payload');
//       }
      
//       console.log(`📨 Sending SMS to ${payload.mobile}`);
//       const result = await smsService.sendSMS({
//         numbers: payload.mobile,
//         message: payload.message,
//         type: payload.messageType || 'notification',
//       });
//       console.log('✅ SMS sent successfully', result);
//     } else {
//       throw new Error(`Unknown notification type: ${type}`);
//     }
//   } catch (error) {
//     console.error('❌ Job processing failed:', error);
//     throw error; // Important to ensure job failure is recorded
//   }
// });

// // SINGLE SET OF EVENT LISTENERS (no duplicates)
// agenda.on('start', (job) => {
//   console.log(`⏳ Job ${job.attrs.name} started (ID: ${job.attrs._id})`);
// });

// agenda.on('complete', (job) => {
//   console.log(`✅ Job ${job.attrs.name} completed (ID: ${job.attrs._id})`);
//   job.attrs.lockedAt = null; // Clean up lock
//   job.save().catch(console.error);
// });

// agenda.on('fail', (error, job) => {
//   console.error(`❌ Job ${job.attrs.name} failed (ID: ${job.attrs._id})`, error);
//   job.attrs.lockedAt = null; // Clean up lock
//   job.save().catch(console.error);
// });

// // Start Agenda
// await agenda.start();
// console.log('🚀 Agenda started');

// // Verify the job processor is registered
// console.log('Registered job types:', agenda._definitions);

// export default agenda;