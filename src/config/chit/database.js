import mongoose from 'mongoose';
import config from '../chit/env.js';

const connectDB = async () => {
  try {
    mongoose.connect(config.MONGODB_URI).then(() => {
      console.info(`MongoDB Connected`);
    })
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 