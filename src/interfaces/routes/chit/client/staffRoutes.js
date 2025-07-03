import express from 'express';
import StaffUserController from '../../../controllers/chit/admin/client/staffuserController.js';
import StaffRepository from '../../../../infrastructure/repositories/chit/StaffUserRepository.js';
import StaffUseCase from '../../../../usecases/auth/chit/client/StaffUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/validation.js';
import S3Service from '../../../../utils/s3Bucket.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import HashingService from '../../../../utils/bcrypt.js';

const router= express.Router();
const tokenService= new TokenService();
const hashingService= new HashingService();
const validator = new Validator()
const s3service= new S3Service();
const authMiddleware= new AuthMiddleware(tokenService)



const staffRepository= new StaffRepository();
const staffUseCase= new StaffUseCase(staffRepository,hashingService);

const staffController= new StaffUserController(staffUseCase,validator);

router.use(authMiddleware.protect);
router.post('/table',(req,res)=>staffController.getAllStaffs(req,res));
router.post('/',(req,res)=>staffController.addStaff(req,res));
router.patch('/:id',(req,res)=>staffController.editStaff(req,res));
router.delete('/:id',(req,res)=>staffController.deleteStaff(req,res));
router.patch('/:id/active',(req,res)=>staffController.toggleStaffStatus(req,res));
router.get('/:id',(req,res)=>staffController.getStaffById(req,res))

export default router;