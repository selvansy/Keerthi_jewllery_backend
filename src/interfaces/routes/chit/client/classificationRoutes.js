import ClassificationUseCase from '../../../../usecases/auth/chit/client/ClassificationUseCase.js';
import ClassificationController from '../../../controllers/chit/admin/client/classificationController.js';
import Validator from '../../../../utils/validations/validation.js';
import ClassificationRepository from '../../../../infrastructure/repositories/chit/ClassificationRepository.js';
import S3Service from '../../../../utils/s3Bucket.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../../utils/jwtToken.js';
import {upload} from '../../../../utils/multer.js';
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
import express from 'express';

const router = express.Router();

const validator = new Validator();
const s3service= new S3Service();
const tokenService= new TokenService();
const authMiddleware= new AuthMiddleware(tokenService);
const s3Repo = new S3BucketRepository()

const classificationRepository= new ClassificationRepository();
const classificationUseCase= new ClassificationUseCase(classificationRepository,s3service,s3Repo);

const classificationController= new ClassificationController(classificationUseCase,validator)

//scheme classification
router.get('/scheme',(req,res)=>classificationController.getSchemeClassification(req,res))
router.get('/',(req,res)=>classificationController.getAllActiveClassifications(req,res))
router.post('/table',(req,res)=>classificationController.getAllClassifications(req,res));
router.get('/:id',(req,res)=>classificationController.getClassificationById(req,res));
router.use(authMiddleware.protect);
router.post('/',upload.handleUpload([
    { name: 'logo', maxCount: 1 },
    { name: 'desc_img', maxCount: 1 }
  ]),(req,res)=>classificationController.addSchemeClassification(req,res));
router.patch('/:id',upload.handleUpload([
    { name: 'logo', maxCount: 1 },
    { name: 'desc_img', maxCount: 1 }
  ]),(req,res)=>classificationController.updateClassification(req,res));
router.delete('/:id',(req,res)=>classificationController.deleteClassification(req,res));
router.patch('/:id/active',(req,res)=>classificationController.toggleActiveStatus(req,res));
router.get('/branch/:id',(req,res)=>classificationController.getClassificationByBranch(req,res))


export default router;