import express from 'express';
import SchemeTypeController from '../../../controllers/chit/admin/client/schemetypeController.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/validation.js';
import S3Service from '../../../../utils/s3Bucket.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import {upload} from '../../../../utils/multer.js';
import HashingService from '../../../../utils/bcrypt.js';
import SchemeTypeRepository from '../../../../infrastructure/repositories/chit/SchemeTypeRepository.js';
import SchemeTypeUseCase from '../../../../usecases/auth/chit/client/SchemeTypeUseCase.js';

const router = express.Router();

const tokenService= new TokenService();
const hashingService= new HashingService();
const validator = new Validator()
const s3service= new S3Service();
const authMiddleware= new AuthMiddleware(tokenService);

const schemeTypeRepository= new SchemeTypeRepository()
const schemetypeUseCase= new SchemeTypeUseCase(schemeTypeRepository);

const schemetypeController= new SchemeTypeController(schemetypeUseCase,validator);

router.get('/:id',(req,res)=>schemetypeController.getSchemeTypeByid(req,res));
router.post('/table',(req,res)=>schemetypeController.schemeTypeTable(req,res));
router.get('/',(req,res)=>schemetypeController.getAllActiveSchemeTypes(req,res));
router.use(authMiddleware.protect);
router.post('/',(req,res)=>schemetypeController.addSchemeType(req,res));
router.patch('/:id',(req,res)=>schemetypeController.editSchemeType(req,res));
router.delete('/:id',(req,res)=>schemetypeController.deleteSchemeType(req,res));
router.patch('/:id/active',(req,res)=>schemetypeController.changeSchemeTypeStatus(req,res));

export default router;