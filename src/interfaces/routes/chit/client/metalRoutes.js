import express from 'express';
import MetalController from '../../../controllers/chit/admin/client/metalController.js';
import MetalRepositroy from '../../../../infrastructure/repositories/chit/MetalRepository.js';
import MetalUseCase from '../../../../usecases/auth/chit/client/MetalUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/validation.js';
import S3Service from '../../../../utils/s3Bucket.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import {upload} from '../../../../utils/multer.js';
import HashingService from '../../../../utils/bcrypt.js';
const router = express.Router();

const tokenService= new TokenService();
const hashingService= new HashingService();
const validator = new Validator()
const s3service= new S3Service();
const authMiddleware= new AuthMiddleware(tokenService)

const metalRepository= new MetalRepositroy();
const metalUseCase= new MetalUseCase(metalRepository);

const metalController= new MetalController(metalUseCase,validator);

router.get('/',(req,res)=>metalController.getAllMetals(req,res));
router.get('/:id',(req,res)=>metalController.getMetalById(req,res));
router.use(authMiddleware.protect);
router.post('/table',(req,res)=>metalController.metalTableData(req,res));
router.post('/',(req,res)=>metalController.addMetal(req,res));
router.patch('/:id',(req,res)=>metalController.editMetal(req,res));
router.delete('/:id',(req,res)=>metalController.deleteMetal(req,res));
router.patch('/:id/active',(req,res)=>metalController.toggleMetalActiveState(req,res));

export default router;