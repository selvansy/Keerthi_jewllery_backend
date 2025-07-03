import express from 'express'
import WeddingBirthDayController from '../../../controllers/chit/admin/client/weddingNotificationController.js';
import WeddingUsecase from '../../../../usecases/auth/chit/client/weddingUsecase.js';
import WeddigRepository from '../../../../infrastructure/repositories/chit/weddingRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
import { upload } from "../../../../utils/multer.js";
import S3Service from '../../../../utils/s3Bucket.js'


const router = express.Router()

const s3Service = new S3Service()
const s3Respo = new S3BucketRepository()
const tokenService = new TokenService()
const authMiddleware = new AuthMiddleware(tokenService);
const weddingRepo = new WeddigRepository()
const weddingUsecase = new WeddingUsecase(weddingRepo,s3Respo,s3Service)

const weddingController = new WeddingBirthDayController(weddingUsecase)

router.use(authMiddleware.protect)
router.post('/',upload.handleUpload([{ name: "image", maxCount: 1 }]),(req,res)=>weddingController.addWeddingBirthday(req,res))
router.post('/table',(req,res)=>weddingController.dataTable(req,res))
router.get('/:id',(req,res)=>weddingController.findById(req,res))





export default router;