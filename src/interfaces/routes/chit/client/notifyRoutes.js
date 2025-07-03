import express from 'express';
import PushNotificationUseCase from '../../../../usecases/auth/chit/client/pushNotificationUseCase.js';
import PushNotificationRepository from '../../../../infrastructure/repositories/chit/pushNotificationRepository.js';
import TokenSerivce from '../../../../utils/jwtToken.js'
import { upload } from "../../../../utils/multer.js";
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import NotifyController from '../../../controllers/chit/admin/client/notifyController.js';
import S3Service from '../../../../utils/s3Bucket.js'
import CustomersRepository from '../../../../infrastructure/repositories/chit/CustomerRepository.js'
import NotificationRepository from '../../../../infrastructure/repositories/chit/super/notificationRepository.js'
import S3Repo from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js'

const router = express.Router()

const pushnotificationRepo = new PushNotificationRepository()
const s3Service = new S3Service()
const customersRepository = new CustomersRepository();
const notificationRespository = new NotificationRepository()
const s3Respo = new S3Repo()
const pushnotificaitonUsecase = new PushNotificationUseCase(pushnotificationRepo,s3Service,customersRepository,notificationRespository,s3Respo);
const tokenService = new TokenSerivce()
const authMiddleware = new AuthMiddleware(tokenService);

const notifyController = new NotifyController(pushnotificaitonUsecase)

router.use(authMiddleware.protect)

router.post('/',upload.handleUpload([{ name: "image", maxCount: 1 }]),(req,res)=>notifyController.addNotification(req,res))
router.post('/promotion',upload.handleUpload([{ name: "image", maxCount: 1 }]),(req,res)=>notifyController.addPromotion(req,res))
router.post('/push-notify-table',(req,res)=>notifyController.pushnotificationTable(req,res));
router.post('/pormotion-table',(req,res)=>notifyController.promotionTable(req,res)); // spelling mistake
router.get('/:id',(req,res)=>notifyController.getNotificationById(req,res));
router.post("/schemecustomers",(req,res)=>notifyController.getSchemeCustomers(req,res))
// router.post('/table',(req,res)=>notifyController.getNotificationList(req,res));

// router.get('/type',(req,res)=>notifyController.getWeddingBirthday(re,res));
// router.delete('/permenentdelete/:id',(req,res)=>notifyController.deletepushnotification(req,res));

export default router;