import express from 'express';
import CampaignTypeController from '../../../controllers/chit/admin/client/campaignTypeController.js';
import CampaignTypeUseCase from '../../../../usecases/auth/chit/client/CampaignTypeUseCase.js';
import CampaignTypeRepository from '../../../../infrastructure/repositories/chit/CampaignTypeRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/validation.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
// import S3Service from '../../../../utils/s3Bucket.js';
// import {upload} from '../../../../utils/multer.js';
// import HashingService from '../../../../utils/bcrypt.js';
const router = express.Router();

const tokenService= new TokenService();
const validator = new Validator()
const authMiddleware= new AuthMiddleware(tokenService)
// const hashingService= new HashingService();
// const s3service= new S3Service();



const campaignTypeRepository= new CampaignTypeRepository();
const campaignTypeUseCase= new CampaignTypeUseCase(campaignTypeRepository);

const campaignTypeController= new CampaignTypeController(campaignTypeUseCase,validator);

router.use(authMiddleware.protect);
router.post('/allcampaigntype',(req,res)=>campaignTypeController.getAllActiveCampaignTypeSettings(req,res));
router.get('/:id',(req,res)=>campaignTypeController.getCampaignTypeById(req,res));
router.post('/',(req,res)=>campaignTypeController.addCampaignTypeSetting(req,res));
router.patch('/:id',authMiddleware.protect,(req,res)=>campaignTypeController.editCampaignTypeSetting(req,res));
router.delete('/:id',authMiddleware.protect,(req,res)=>campaignTypeController.deleteCampaignTypeSetting(req,res));
router.patch('/:id/active',authMiddleware.protect,(req,res)=>campaignTypeController.changeCampaignTypeActiveStatus(req,res));
router.get('/',(req,res)=>campaignTypeController.getAllCampaignType(req,res));

export default router;