import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config/chit/env.js';
import connectDB from './config/chit/database.js';
import authRoutes from './interfaces/routes/chit/admin/authRoutes.js';
import adminRoutes from './interfaces/routes/chit/admin/adminRoutes.js';
import clientRoutes from './interfaces/routes/chit/client/indexRoute.js';
import paymentHook from './config/chit/paymentService.js'
import otpRoutes from './interfaces/routes/chit/client/otpRoutes.js'
import AppError from './utils/errors/AppError.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import notificationRoutes from './notification-routes.js'
import './config/chit/cronSetup.js'
import './cron/digigoldAutoCron.js'
import exportRoutes from "./interfaces/controllers/chit/admin/client/exportController.js"

(function setupGlobalErrorLogger() {
  if (typeof process !== 'undefined' && process.on) {
    process.on('uncaughtException', function (err) {
      console.error('[Uncaught Exception]');
      console.error('Message:', err.message);
      console.error('Stack Trace:', err.stack);
    });

    process.on('unhandledRejection', function (reason, promise) {
      console.error('[Unhandled Promise Rejection]');
      console.error('Reason:', reason);
      if (reason && reason.stack) {
        console.error('Stack Trace:', reason.stack);
      }
    });
  }
})();


const app = express();


(async () => {
  await connectDB();
})();

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); 
    },
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
// app.use(
//   cors({
//     origin: [config.FRONT_URL],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/otp',otpRoutes)
app.use('/api/webhook',paymentHook);
app.use('/api/push', notificationRoutes);
app.use('/api/import',exportRoutes)


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

export default app;