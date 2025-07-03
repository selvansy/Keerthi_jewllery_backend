import express from 'express';
import WhatsappController from '../../../controllers/chit/admin/super/whatsappController.js';
import WhatsAppRepository from '../../../../infrastructure/repositories/chit/super/whatsappRepository.js';
import WhatsAppUseCase from '../../../../usecases/auth/chit/admin/whatsappUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';


const router = express.Router();

const whatsappRepository = new WhatsAppRepository()
const whatsappUseCase = new WhatsAppUseCase(whatsappRepository);
const tokenService= new TokenService()
const authMiddleware = new AuthMiddleware(tokenService)

const whatsappController = new WhatsappController(whatsappUseCase);


router.use(authMiddleware.protect);
router.post('/',(req,res)=> whatsappController.addWhatsappSetting(req,res));
// router.get('/branch/:branchId',(req,res)=> whatsappController.getByBranchId(req,res));
router.get('/project/:projectId/branch/:branchId',(req,res)=> whatsappController.getByBranchAndProjectId(req,res));

export default router;