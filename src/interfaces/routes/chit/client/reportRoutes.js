import express, { Router } from 'express'
import ReportController from '../../../controllers/chit/admin/client/reportController.js';
import ReportRepository from '../../../../infrastructure/repositories/chit/reportsRepository.js';
import ReportUseCase from '../../../../usecases/auth/chit/client/reportsUsecase.js';
import BranchRepository from '../../../../infrastructure/repositories/chit/brachRepository.js';

const router = express.Router()

const reportRepo = new ReportRepository()
const branchRepo= new BranchRepository()
const reportUsecase = new ReportUseCase(reportRepo,branchRepo)
const reportController = new ReportController(reportUsecase)



// router.post('/preclosesummary',(req,res)=>reportController.getPreCloseSummary(req,res))
// router.post('/redeemptionsummary',(req,res)=>reportController.getRedeemptionSummary(req,res))
// router.post('/refundsummary',(req,res)=>reportController.getRefundSummary(req,res))
// router.get('/employeereferral',(req,res)=>reportController.employeeReferralReport(req,res));
// router.post('/schemeoverall',(req,res)=>reportController.getOverAllReport(req,res))
// router.post('/paymentledger',(req,res)=>reportController.getPaymentLedger(req,res))




// router.post('/outstanding',(req,res)=>reportController.getOutstandingReport(req,res)) ////////////////////////
// router.get('/employeereferral',(req,res)=>reportController.employeeReferralReport(req,res));
// router.get('/customerreferral',(req,res)=>reportController.customerReferralReport(req,res));////////////////////////
// router.post('/outstandingweight',(req,res)=>reportController.outstandingWeight(req,res))

router.post('/giftreport',(req,res)=>reportController.giftReport(req,res))
router.post('/overallreport',(req,res)=>reportController.overAllReport(req,res))
router.post('/overdue',(req,res)=>reportController.overduesummary(req,res))
router.post('/accountsummary',(req,res)=>reportController.accountsummary(req,res))
router.post('/paymentsummary',(req,res)=>reportController.getPaymentSummary(req,res))
router.post('/account/completed',(req,res)=>reportController.accountCompleted(req,res))
router.post('/preclosesummary',(req,res)=>reportController.getPreCloseSummary(req,res))
router.post('/closedsummary',(req,res)=>reportController.getCloseSummary(req,res))
router.post('/refundsummary',(req,res)=>reportController.getRefendSummary(req,res))
router.post('/paymentledger',(req,res)=>reportController.getPaymentLedger(req,res))
router.post('/amountpayble',(req,res)=>reportController.getAmountPayble(req,res))
router.post('/weightpayble',(req,res)=>reportController.getWeightPayble(req,res))
router.post('/employeereffer',(req,res)=>reportController.getEmployeeRefferal(req,res))
router.post('/customerreffer',(req,res)=>reportController.getCustomerRefferal(req,res))
router.post("/activeaccounts",(req,res)=>reportController.getActiveAccounts(req,res))
router.post("/redeemedaccounts",(req,res)=>reportController.getRedeemedAccounts(req,res))


//! drill down option routes
router.get("/scheme",(req,res)=>reportController.getSchemeDetailedView(req,res))
router.post("/amount",(req,res)=>reportController.getAmountDetailedView(req,res))
    

export default router;