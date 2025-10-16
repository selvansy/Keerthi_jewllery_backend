import express from 'express';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../../utils/jwtToken.js';
import PrintUseCase from '../../../../usecases/auth/chit/client/printUsecase.js';
import PrintRepository from '../../../../infrastructure/repositories/chit/printRepository.js';
import PrintController from '../../../controllers/chit/admin/client/printController.js';



const router = express.Router();

const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService)

const printRepository = new PrintRepository()
const printUseCase = new PrintUseCase(printRepository)
const printController = new PrintController(printUseCase)

router.use(authMiddleware.protect)
router.post('/receipt',(req,res)=>printController.getReceipt(req,res))
router.post('/receipt/print',(req,res)=>printController.getReceiptByPaymentId(req,res));


export default router;