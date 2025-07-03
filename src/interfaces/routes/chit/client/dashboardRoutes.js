import express from "express";
import DashboardController from "../../../controllers/chit/admin/client/dashboardController.js";
import DashboardUseCase from "../../../../usecases/auth/chit/client/dashboardUseCase.js";
import BranchRepository from '../../../../infrastructure/repositories/chit/brachRepository.js';
import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import DashboardRepository from "../../../../infrastructure/repositories/chit/dashboardRepository.js";

const router = express.Router();

const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

const brachRepository = new BranchRepository()
const dashboardRepository = new DashboardRepository()

const dashboardUseCase = new DashboardUseCase(brachRepository,dashboardRepository);
const dashboardController = new DashboardController(dashboardUseCase)

router.use(authMiddleware.protect)
router.post('/overall',(req,res)=>dashboardController.getAllOver(req,res));
router.post('/accountreview',(req,res)=>dashboardController.accountStat(req,res));
router.post('/account',(req,res)=>dashboardController.account(req,res));

router.post('/summary/paymentmode',(req,res)=>dashboardController.getPaymetModeSummay(req,res))
router.post('/paymenthistory',(req,res)=>dashboardController.getPaymentHistory(req,res))
router.post('/paymentmodehistory',(req,res)=>dashboardController.paymentModeData(req,res))


export default router;