import express from 'express';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../../utils/jwtToken.js';
// import { upload } from "../../../../utils/multer.js";
// import S3Service from '../../../../utils/s3Bucket.js';
// import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
import SaveNotificationRepo from '../../../../infrastructure/repositories/chit/saveNotificationRepo.js';
import SaveNotificationUsecase from '../../../../usecases/auth/chit/client/saveNotificationUsecase.js';
import saveNotificationController from '../../../controllers/chit/admin/client/saveNotificationController.js';


const router = express.Router();

const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService)

const savenotificaitonRepo = new SaveNotificationRepo()
const savednotificationUsecase = new SaveNotificationUsecase(savenotificaitonRepo)
const savenotificationController = new saveNotificationController(savednotificationUsecase)

router.use(authMiddleware.protect)
router.get('/',(req,res)=>savenotificationController.getUserNotifications(req,res));
router.patch('/',(req,res)=>savenotificationController.updateNotificationStatus(req,res))
router.patch('/clear',(req,res)=>savenotificationController.clearAllNotification(req,res))
router.patch('/read',(req,res)=>savenotificationController.readAllNotification(req,res))
router.get('/count',(req,res)=>savenotificationController.notificationCount(req,res));

export default router;