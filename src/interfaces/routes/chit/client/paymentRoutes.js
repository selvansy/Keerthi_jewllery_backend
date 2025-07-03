import express from 'express';
import PaymentController from '../../../controllers/chit/admin/client/paymentController.js';
import PaymentRepository from '../../../../infrastructure/repositories/chit/paymentRepository.js';
import MetalRateRepository from '../../../../infrastructure/repositories/chit/metalRateRepository.js';
import SchemeRepository from '../../../../infrastructure/repositories/chit/schemeRepository.js';
import CustomerRepository from '../../../../infrastructure/repositories/chit/CustomerRepository.js';
import GeneralSettingRepository from '../../../../infrastructure/repositories/chit/generalSettingRepository.js';
import PaymentUseCase from '../../../../usecases/auth/chit/client/paymentUseCase.js';
import SchemeAccountRepository from '../../../../infrastructure/repositories/chit/schemeAccountRepository.js';
import SchemeAccountUseCase from '../../../../usecases/auth/chit/client/schemeAccountUseCase.js';
import CustomerRewardRepository from '../../../../infrastructure/repositories/chit/customerRewardRepository.js';
import TransactionDetailsRepository from '../../../../infrastructure/repositories/chit/transactionDetailsRepository.js';
import TransactionRepository from '../../../../infrastructure/repositories/chit/transactionRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import Validator from '../../../../utils/validations/purityValidations.js';
import SmsSettingRepository from '../../../../infrastructure/repositories/chit/super/smsSettingRepository.js';
import TopupRepository from '../../../../infrastructure/repositories/chit/topupRepository.js';
import PaymentOrderRepository from '../../../../infrastructure/repositories/chit/paymentOrderRepository.js';
import PaymentModeRepository from '../../../../infrastructure/repositories/chit/PaymentModeRepository.js';
import WalletRepository from '../../../../infrastructure/repositories/chit/walletRepository.js';
import EmployeeRepository from '../../../../infrastructure/repositories/chit/EmployeeRepository.js';
import NotificationConfigRepository from '../../../../infrastructure/repositories/chit/notificationConfigRepository.js';

const router = express.Router();

const tokenService = new TokenService();
const authMiddleware= new AuthMiddleware(tokenService)

const paymentRepository = new PaymentRepository();
const customerRepo = new CustomerRepository()
const metalrateRepository= new MetalRateRepository();
const schemeRepository= new SchemeRepository();
const generalSettingRepository =new GeneralSettingRepository();
const schemeAccountRepository = new SchemeAccountRepository();
const customerRewardRepository= new CustomerRewardRepository();
const transactionDetailsRepository = new TransactionDetailsRepository()
const transactionRepository = new TransactionRepository()
const smsRepo = new SmsSettingRepository()
const topupRepo = new TopupRepository()
const paymentOrderRepo= new PaymentOrderRepository()
const paymentModeRepo = new PaymentModeRepository()
const walletRepo= new WalletRepository()
const emplyeeRepo = new EmployeeRepository()
const notificationconfig = new NotificationConfigRepository()

const paymentUseCase = new PaymentUseCase(paymentRepository,metalrateRepository,schemeRepository,generalSettingRepository,schemeAccountRepository
    ,customerRewardRepository,transactionDetailsRepository,transactionRepository,smsRepo,topupRepo,paymentOrderRepo,customerRepo,paymentModeRepo,
    emplyeeRepo,walletRepo,notificationconfig
)

const schemAccoutUseCase= new SchemeAccountUseCase(schemeAccountRepository,null,null,null,customerRepo)

const paymentController = new PaymentController(paymentUseCase,schemAccoutUseCase);

router.post('/mobile/webhook',(req,res)=>paymentController.webhook(req,res))
router.use(authMiddleware.protect);

router.post('/',(req,res)=>paymentController.addPayment(req,res));
router.get("/schacc",(req,res)=>paymentController.getPaymentBySchemeAccount(req,res))  
router.get('/:id',(req,res)=>paymentController.getPaymentById(req,res));
router.get('/metalrate/:date',(req,res)=>paymentController.getTodayMetalRate(req,res));
router.post('/table',(req,res)=>paymentController.paymentTable(req,res))
router.get('/schemeaccount/:id',(req,res)=>paymentController.getPaymentsBySchemeId(req,res))

// router.patch('/:id',(req,res)=>paymentController.editPayment(req,res));
// router.patch('/:id',(req,res)=>paymentController.editPayment(req,res));

//!mobile payment api
router.post('/mobile/create-order',(req,res)=>paymentController.processPayment(req,res))
router.get('/mobile/payment-status',(req,res)=>paymentController.paymentStatus(req,res))
router.post('/mobile/digi-payment',(req,res)=>paymentController.digiGoldPayment(req,res))

export default router; 