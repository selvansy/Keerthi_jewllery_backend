import express from 'express';
import GeneralSettingRepository from '../../../../infrastructure/repositories/chit/super/generalSettingRepository.js';
import GeneralsettingController from '../../../controllers/chit/admin/super/generalSettingController.js';
import GeneralSettingUseCase from '../../../../usecases/auth/chit/admin/generalSettingUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import Validator from '../.../../../../../utils/validations/generalSettingValidations.js'

const router= express.Router()

const tokenService = new TokenService()
const authMiddleware = new AuthMiddleware(tokenService);
const validator = new Validator()

const generalSettingRepo = new GeneralSettingRepository();
const generalSettingUseCase = new GeneralSettingUseCase(generalSettingRepo);

const generalSettingController = new GeneralsettingController(generalSettingUseCase,validator);

router.use(authMiddleware.protect);

router.post('/',(req,res)=>generalSettingController.addSettings(req,res));
router.get('/branch/:branchId',(req,res)=>generalSettingController.getSettingByBranch(req,res));
router.get('/project/:projectId/branch/:branchId',(req,res)=>generalSettingController.getByProjectAndBranch(req,res))

export default router;