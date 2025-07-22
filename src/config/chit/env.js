import dotenv from 'dotenv';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRES_IN || '24h',
  COOKIE_MAXAGE: 24 * 60 * 60 * 1000, 
  AWS_ACCESS_KEY_ID:process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY:process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_LOCAL_PATH: process.env.AWS_LOCAL_PATH,
  FRONT_URL:process.env.FRONT_URL,
  CASHFREE_SECRET:process.env.CASHFREE_SECRET,
  CASHFREE_CLIENT_ID:process.env.CASHFREE_CLIENT_ID,
  ORDER_URL: process.env.ORDER_URL,
  PAYMENT_API:process.env.PAYMENT_API,
  API_VERSION:process.env.API_VERSION,
  ONE_SIGNAL_APP_ID: process.env.API_ID,
  ONE_SIGNAL_API_KEY: process.env.API_KEY,
  CASH_FREE_URL:process.env.CASH_FREE_URL
};

export default config; 