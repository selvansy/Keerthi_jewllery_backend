import express from 'express';
import SchemeController from '../../../controllers/chit/admin/client/schemeController.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/validation.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import SchemeUseCase from '../../../../usecases/auth/chit/client/SchemeUseCase.js';
import SchemeRepository from '../../../../infrastructure/repositories/chit/schemeRepository.js';
import MetalRepository from '../../../../infrastructure/repositories/chit/MetalRepository.js';
import PurityRespository from '../../../../infrastructure/repositories/chit/purityReporsitory.js'
import { upload } from "../../../../utils/multer.js";
import S3Service from '../../../../utils/s3Bucket.js';
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';

const router= express.Router();

const tokenService= new TokenService();
const validator = new Validator()
const authMiddleware= new AuthMiddleware(tokenService)


const schemeRepository= new SchemeRepository()
const metalRepository = new MetalRepository();
const purityRepository = new PurityRespository()
const s3Repo = new S3BucketRepository()
const s3Service=new S3Service()
const schemeUseCase= new SchemeUseCase(schemeRepository,metalRepository,purityRepository,
    s3Repo,s3Service
);

const schemeController= new SchemeController(schemeUseCase,validator);

router.get('/',(req,res)=>schemeController.getAllActiveSchemes(req,res))
router.get('/classification', (req, res) => schemeController.getSchemeByclassificationId(req, res));
router.get('/digigold',(req,res)=>schemeController.getDigigoldStaticData(req,res))
router.get('/:id',(req,res)=>schemeController.getSchemeById(req,res));
router.get('/branch/:branchId',(req,res)=>schemeController.getSchemeByBrachId(req,res));
router.get('/digigold/:type',(req,res)=>schemeController.getDigiGoldSchemes(req,res))
router.use(authMiddleware.protect);
router.post('/',upload.handleUpload([{name:"logo",maxCount:1},{name:"desc_img",maxCount:1}]),(req,res)=>schemeController.addScheme(req,res));
router.post('/table',(req,res)=>schemeController.schemesTableData(req,res));
router.patch('/:id',upload.handleUpload([{name:"logo",maxCount:1},{name:"desc_img",maxCount:1}]),(req,res)=>schemeController.updateScheme(req,res));
router.delete('/:id',(req,res)=>schemeController.deleteScheme(req,res));
router.patch('/:id/active',(req,res)=>schemeController.toggleSchemeStatus(req,res));
router.post('/delist',(req,res)=>schemeController.getDelistSchemes(req,res));

router.get('/branch/:branchId', (req, res) => schemeController.getAllBranchScheme(req, res));

export default router;