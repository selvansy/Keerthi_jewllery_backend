import express from 'express';
import NotificationSettingController from '../../../controllers/chit/admin/super/notificationSettingController.js';
import NotificationSettingUseCase from '../../../../usecases/auth/chit/admin/notificationSettingUseCase.js';
import NotificationSettingRepository from '../../../../infrastructure/repositories/chit/super/notificationRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js"


const router= express.Router()
const tokenService = new TokenService();
const authMiddleWare= new AuthMiddleware(tokenService);

const notificationRepo = new NotificationSettingRepository();
const notificationUseCase = new NotificationSettingUseCase(notificationRepo);

const notificationController = new NotificationSettingController(notificationUseCase);

router.use(authMiddleWare.protect)
router.post('/',(req,res)=>notificationController.addNotificationSetting(req,res));
router.get('/branch/:branchId',(req,res)=>notificationController.getNotificationSettByBranchId(req,res));
router.get('/project/:projectId/branch/:branchId',(req,res)=>notificationController.getSettingByProjectAndBranchId(req,res))




export default router;