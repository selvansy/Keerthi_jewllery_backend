import express from 'express';
import otpController from '../../../controllers/chit/admin/client/otpController.js';
import OtpRepository from '../../../../infrastructure/repositories/chit/otpRepository.js';
import otpUseCase from '../../../../usecases/auth/chit/client/otpUseCase.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../../utils/jwtToken.js';

const router = express.Router()

const tokenService = new TokenService();
const authMiddleware= new AuthMiddleware(tokenService)

const otprepo = new OtpRepository()
const otpusecase = new otpUseCase(otprepo);
const otpcontroller = new otpController(otpusecase)

router.use(authMiddleware.protect);
router.post('/verifyotp',(req,res)=>otpcontroller.verifyOtp(req,res));

export default router;