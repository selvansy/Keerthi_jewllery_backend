import express from 'express';
import SchemeAccountContorller from '../../../controllers/chit/admin/client/schemeAccountController.js';
import SchemeAccountUseCase from '../../../../usecases/auth/chit/client/schemeAccountUseCase.js';
import SchemeAccountRepository from '../../../../infrastructure/repositories/chit/schemeAccountRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/schemeAccountValidator.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import EmployeeRepository from '../../../../infrastructure/repositories/chit/EmployeeRepository.js';
import SchemeRepository from '../../../../infrastructure/repositories/chit/schemeRepository.js';
import ClosAccRepository from '../../../../infrastructure/repositories/chit/closeAccountRepository.js';
import CustomerRepository from '../../../../infrastructure/repositories/chit/CustomerRepository.js'
import SchemeTypeRepo from '../../../../infrastructure/repositories/chit/SchemeTypeRepository.js'
import MetalRepo from '../../../../infrastructure/repositories/chit/MetalRepository.js';
import PaymentRepo from '../../../../infrastructure/repositories/chit/paymentRepository.js';
import GiftIssuesRepo from '../../../../infrastructure/repositories/chit/giftIssuesRepository.js';
import PurityRepo from '../../../../infrastructure/repositories/chit/purityReporsitory.js';
import SmsSettingRepository from '../../../../infrastructure/repositories/chit/super/smsSettingRepository.js';
import SmsSender from '../../../../utils/sendSms.js';
import GeneralSettingRepository from '../../../../infrastructure/repositories/chit/super/generalSettingRepository.js';
import OtpRepository from '../../../../infrastructure/repositories/chit/otpRepository.js';
import topupRepository from '../../../../infrastructure/repositories/chit/topupRepository.js';

const router= express.Router();
const tokenService= new TokenService();
const authMiddleware= new AuthMiddleware(tokenService);
const validator= new Validator();

const schemetypeRepo = new SchemeTypeRepo();
const metalRepo = new MetalRepo();
const paymentRepo = new PaymentRepo();
const giftIssueRepo = new GiftIssuesRepo()
const schemeRespo = new SchemeRepository()
const purityRepo = new PurityRepo()
const schemeAccountRepository= new SchemeAccountRepository();
const employeeRepository = new EmployeeRepository()
const closeAccRepo = new ClosAccRepository()
const customerRepo = new CustomerRepository()
const smsRepo = new SmsSettingRepository()
const smsSender = new SmsSender()
const otpRepo = new OtpRepository()
const generalsettingRepo = new GeneralSettingRepository()
const topupRepo = new topupRepository()
const schemAccoutUseCase= new SchemeAccountUseCase(schemeAccountRepository,employeeRepository,schemeRespo,
    closeAccRepo,customerRepo,schemetypeRepo,metalRepo,paymentRepo,giftIssueRepo,purityRepo,smsRepo,
    generalsettingRepo,otpRepo,smsSender,topupRepo
)

const schemeAccountController= new SchemeAccountContorller(schemAccoutUseCase,validator)

router.use(authMiddleware.protect) 
//!dont modify any api without proper checking !
router.get('/overdue',(req,res)=>schemeAccountController.overdueCalculation(req,res))
router.post('/search', (req, res) => schemeAccountController.customMobileSearch(req, res));
router.get('/revert',(req,res)=>schemeAccountController.getRevertedDetails(req,res))
router.get('/accountcount',(req,res)=>schemeAccountController.findCustomerAccountCounts(req,res))
router.post('/', (req, res) => schemeAccountController.addSchemeAccount(req, res));
router.patch('/:id', (req, res) => schemeAccountController.editSchemeAccount(req, res));
router.delete('/:id', (req, res) => schemeAccountController.deleteSchemeAccount(req, res));
router.patch('/:id/active', (req, res) => schemeAccountController.activateSchemeAccount(req, res));
router.get('/', (req, res) => schemeAccountController.getAllSchemeAccounts(req, res));
router.post('/table',(req,res)=>schemeAccountController.getSchemeAccountTable(req,res))
router.patch('/:id/revert', (req, res) => schemeAccountController.revertSchemeAccount(req, res));
router.patch('/:id/close', (req, res) => schemeAccountController.closeSchemeAccount(req, res));
router.patch('/:id/extendinstallment', (req, res) => schemeAccountController.extendInstallment(req, res));
router.get('/branch/:branchId/customer/search', (req, res) => schemeAccountController.searchCustomerByMobile(req, res));
router.get('/branch/:branchId/customer/:customerId', (req, res) => schemeAccountController.getCustomerAccount(req, res));
router.get('/:id', (req, res) => schemeAccountController.getSchemeAccountById(req, res));
router.get('/:accId/payment',(req,res)=>schemeAccountController.getPaymentByAccNumber(req,res))
router.post('/close/:mobile/branch/:branchId', (req, res) => schemeAccountController.sendOtpForClose(req, res));
router.post('/verifyotp',(req,res)=>schemeAccountController.verifyOtp(req,res))
router.get('/accnum/mobile/search', (req, res) => schemeAccountController.searchAccMobile(req, res));

// router.get('/branch/:brancId/search', (req, res) => schemeAccountController.searchMobieSchemeAccount(req, res));


//*mobile api

//!dont modify any api without proper checking !
router.get('/mobile/schemeaccounts', (req, res) => schemeAccountController.getAllSchemeAccountsForMobile(req, res));
router.get('/mobile/metalsavings', (req, res) => schemeAccountController.getMetalBasedSavings(req, res));

export default router;