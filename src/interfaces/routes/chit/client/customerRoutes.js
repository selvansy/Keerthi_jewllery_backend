import express from 'express';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/customerValidations.js';
import S3Service from '../../../../utils/s3Bucket.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import {upload} from '../../../../utils/multer.js';
import CustomerController from '../../../controllers/chit/admin/client/customerController.js';
import CustomerRepository from '../../../../infrastructure/repositories/chit/CustomerRepository.js';
import CustomerUseCase from '../../../../usecases/auth/chit/client/CustomerUseCase.js';
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
import SmsSender from "../../../../utils/sendSms.js"
import SmsSettingRepository from '../../../../infrastructure/repositories/chit/super/smsSettingRepository.js';
import OtpRepository from '../../../../infrastructure/repositories/chit/otpRepository.js';
import HashingService from '../../../../utils/bcrypt.js';

const router = express.Router();

const tokenService= new TokenService();
const validator = new Validator()
const s3service= new S3Service();
const authMiddleware= new AuthMiddleware(tokenService)
const smsSender = new SmsSender()
const hashingService= new HashingService()

const customerRepository= new CustomerRepository()
const smsRepo = new SmsSettingRepository()
const s3Repo = new S3BucketRepository()
const otpRepo = new OtpRepository()
const customerUseCase = new CustomerUseCase(customerRepository,s3service,s3Repo,
  smsSender,smsRepo,otpRepo,hashingService,tokenService
)

const customerController= new CustomerController(customerUseCase,validator)


router.post('/signup', (req, res) => customerController.signup(req, res));
router.post('/generate-otp',(req,res)=>customerController.generateOtp(req,res) )
router.post('/forgot-password', (req, res) => customerController.forgetPassword(req, res));
router.post('/verify-otp', (req, res) => customerController.verifyOtp(req, res));
router.post('/login',(req,res)=>customerController.login(req,res))
router.post('/forgot-mpin',(req,res)=>customerController.forgetMpin(req,res))

router.use(authMiddleware.protect);

router.post('/change-mpin',(req,res)=>customerController.changeMpin(req,res))

router.post('/verify-mpin',(req,res)=>customerController.verifyMpin(req,res))

router.post(
  '/',
  upload.handleUpload([
    { name: 'cus_img', maxCount: 1 },
    { name: 'id_proof', maxCount: 1 }
  ]),
  (req, res) => customerController.addCustomer(req, res)
);

router.post('/table', (req, res) => customerController.customerTable(req, res));
router.get('/branch/:branchId/search', (req, res) => customerController.searchCustomerByMobileAndBranch(req, res));
router.get('/:id', (req, res) => customerController.getCustomerById(req, res));
router.get('/branch/:id', (req, res) => customerController.getCustomersByBranch(req, res));
router.get('/mobile/search', (req, res) => customerController.searchCustomerByMobile(req, res));
router.patch(
  '/:id',
  upload.handleUpload([
    { name: 'cus_img', maxCount: 1 },
    { name: 'id_proof', maxCount: 1 }
  ]),
  (req, res) => customerController.editCustomer(req, res)
);
router.delete('/:id', (req, res) => customerController.deleteCustomer(req, res));
router.patch('/:id/active', (req, res) => customerController.activateCustomer(req, res));
router.get('/referral/:id',(req,res)=>customerController.getReferralDetals(req,res))
router.post('/overview',(req,res)=>customerController.customerOverview(req,res))
router.post('/scheme',(req,res)=>customerController.findUsersBySchema(req,res))
router.post('/changepass',(req,res)=>customerController.changePassword(req,res))
router.post('/verifypass',(req,res)=>customerController.verfiyPassword(req,res))


export default router;