import express from 'express';
import LayoutSettingController from '../../../controllers/chit/admin/super/layoutSettingController.js';
import LayoutRepository from '../../../../infrastructure/repositories/chit/super/layoutSettingRepository.js';
import LayoutSettingUseCase from '../../../../usecases/auth/chit/admin/layoutSettingUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';



const router = express.Router()

const layoutRepository =new LayoutRepository()
const layoutUseCase = new LayoutSettingUseCase(layoutRepository)
const tokenService =new TokenService()
const authMiddleware = new AuthMiddleware(tokenService)

const layoutController = new LayoutSettingController(layoutUseCase)

router.use(authMiddleware.protect)

router.post('/',(req,res)=>layoutController.addSetting(req,res));
router.patch('/color',(req,res)=>layoutController.updateLayoutColor(req,res));
router.get('/project/:projectId/branch/:branchId',(req,res)=>layoutController.getByProjectAndBranch(req,res))
router.get('/branch/:branchId',(req,res)=>layoutController.getByBranch(req,res));


export default router;