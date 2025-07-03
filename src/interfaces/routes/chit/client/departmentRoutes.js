import express from 'express';
import DepartmentController from '../../../controllers/chit/admin/client/departmentController.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/validation.js';
import S3Service from '../../../../utils/s3Bucket.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import {upload} from '../../../../utils/multer.js';
import HashingService from '../../../../utils/bcrypt.js';
import DepartmentRepository from '../../../../infrastructure/repositories/chit/departmentRepository.js';
import DepartmentUseCase from '../../../../usecases/auth/chit/client/departmentUseCase.js';

const router = express.Router();

const tokenService= new TokenService();
const hashingService= new HashingService();
const validator = new Validator()
const s3service= new S3Service();
const authMiddleware= new AuthMiddleware(tokenService);

const departmentRepository= new DepartmentRepository()
const departmentUseCase= new DepartmentUseCase(departmentRepository);

const departmentController= new DepartmentController(departmentUseCase,validator);

router.use(authMiddleware.protect);
router.get('/:id',(req,res)=>departmentController.getDepartmentByid(req,res));
router.post('/table',(req,res)=>departmentController.departmentTable(req,res));
router.get('/',(req,res)=>departmentController.getAllActiveDepartments(req,res));
router.post('/',(req,res)=>departmentController.addDepartment(req,res));
router.patch('/:id',(req,res)=>departmentController.editDepartment(req,res));
router.delete('/:id',(req,res)=>departmentController.deleteDepartment(req,res));
router.patch('/:id/active',(req,res)=>departmentController.changeDepartmentStatus(req,res));

export default router;