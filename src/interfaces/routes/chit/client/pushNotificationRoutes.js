import express from 'express';
import PushNotificationUseCase from '../../../../usecases/auth/chit/client/pushNotificationUseCase.js';
import PushNotificationRepository from '../../../../infrastructure/repositories/chit/pushNotificationRepository.js';
import TokenSerivce from '../../../..//utils/jwtToken.js'
import { upload } from "../../../../utils/multer.js";
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import PushNotificationController from '../../../controllers/chit/admin/client/pushNotificationController.js';
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

const pushnotificaitonCntroller = new PushNotificationController(pushnotificaitonUsecase)

router.use(authMiddleware.protect)

router.post('/',upload.handleUpload([{ name: "noti_image", maxCount: 5 }]),(req,res)=>pushnotificaitonCntroller.addPushNotification(req,res))
router.post('/table',(req,res)=>pushnotificaitonCntroller.pushnotificationTable(req,res));
router.get('/:id',(req,res)=>pushnotificaitonCntroller.getPushNotoficationById(req,res));
router.get('/type',(req,res)=>pushnotificaitonCntroller.getWeddingBirthday(re,res));
router.delete('/permenentdelete/:id',(req,res)=>pushnotificaitonCntroller.deletepushnotification(req,res));

export default router;