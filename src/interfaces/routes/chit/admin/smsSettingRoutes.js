import express from 'express';
import SmsSettingController from '../../../controllers/chit/admin/super/smsSettingController.js';
import SmsSettingRepository from '../../../../infrastructure/repositories/chit/super/smsSettingRepository.js';
import SmsSettingUseCase from '../../../../usecases/auth/chit/admin/smsSettingUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';



const router = express.Router()

const smssettingRepository =new SmsSettingRepository()
const smssettingUseCase = new SmsSettingUseCase(smssettingRepository)
const tokenService =new TokenService()
const authMiddleware = new AuthMiddleware(tokenService)

const smssettingController = new SmsSettingController(smssettingUseCase)

router.use(authMiddleware.protect)

router.post('/',(req,res)=>smssettingController.addSmsSetting(req,res));
router.get('/project/:projectId/branch/:branchId',(req,res)=>smssettingController.getByProjectAndBranch(req,res))
// router.get('/branch/:branchId',(req,res)=>smssettingController.getByBranch(req,res));


export default router;