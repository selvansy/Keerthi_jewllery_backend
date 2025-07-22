import dotenv from 'dotenv';
import cron from 'node-cron';
import SchemeAccount from '../infrastructure/models/chit/schemeAccountModel.js';
import schemeModel from '../infrastructure/models/chit/schemeModel.js';

dotenv.config();

const TIMEZONE = 'Asia/Kolkata';
const SCHEME_UPDATE_TIME = '00 02 * * *'; // 1:03 AM (Asia/Kolkata time)

class SchemeAccountScheduler {
  constructor() {
    console.log('🏗️ Initializing SchemeAccountScheduler');
    this.initialize();
  }

  async initialize() {
    try {
      this.setupCronJobs();
      console.log('✅ Scheduler initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize scheduler:', error);
      process.exit(1);
    }
  }

  setupCronJobs() {
    const job = cron.schedule(SCHEME_UPDATE_TIME, this.updateSchemeAccounts.bind(this), {
      scheduled: true,
      timezone: TIMEZONE,
    });

  }

  async updateSchemeAccounts() {
    const now = new Date().toLocaleString('en-US', { timeZone: TIMEZONE });
    console.log(`\n[${now}] Starting scheme account maturity update`);
    
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const schemes = await schemeModel.find({ scheme_type: { $in: [10, 14] } });
      
      if (!schemes.length) {
        console.log('ℹ️ No eligible schemes found');
        return;
      }

      const schemeIds = schemes.map(scheme => scheme._id);

      const result = await SchemeAccount.updateMany(
        {
          id_scheme: { $in: schemeIds },
          maturity_date: todayStr,
          active: true,
          is_deleted: false,
          status: { $nin: [1, 2, 3, 4] }
        },
        {
          $set: {
            status: 2,
            updatedAt: new Date(),
          },
        }
      );

      console.log(`\n🎯 Update Results:
      - Matched: ${result.matchedCount}
      - Modified: ${result.modifiedCount}
      - Today's date: ${todayStr}`);

    } catch (error) {
      console.error('❌ Error in updateSchemeAccounts:', error);
    }
  }
}

console.log('\n🚀 Starting SchemeAccountScheduler service');
new SchemeAccountScheduler();