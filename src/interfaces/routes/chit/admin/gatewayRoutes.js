import express from 'express';
import GatewayController from '../../../controllers/chit/admin/super/gatewayController.js';
import GatewayUseCase from '../../../../usecases/auth/chit/admin/gatewayUseCase.js';
import GatewaySettingRepository from '../../../../infrastructure/repositories/chit/super/gateWayRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';



const router = express.Router()

const gatewayRepository =new GatewaySettingRepository()
const gatewayUseCase = new GatewayUseCase(gatewayRepository)
const tokenService =new TokenService()
const authMiddleware = new AuthMiddleware(tokenService)

const gatewayController = new GatewayController(gatewayUseCase)

router.use(authMiddleware.protect)

router.post('/',(req,res)=>gatewayController.addSmsSetting(req,res));
router.get('/project/:projectId/branch/:branchId',(req,res)=>gatewayController.getByProjectAndBranch(req,res))
// // router.get('/branch/:branchId',(req,res)=>smssettingController.getByBranch(req,res));


export default router;