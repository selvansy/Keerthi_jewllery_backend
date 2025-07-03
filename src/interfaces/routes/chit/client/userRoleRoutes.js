import express from 'express';
import UserRoleRepository from '../../../../infrastructure/repositories/chit/userRoleRepository.js';
import UserRoleUseCase from '../../../../usecases/auth/chit/client/userRoleUseCases.js';
import UserRoleController from '../../../controllers/chit/admin/client/useRoleController.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';


const router = express.Router();
const tokenService = new TokenService()
const authMiddleware=new  AuthMiddleware(tokenService)

const userRoleRepository = new UserRoleRepository();
const userRoleUseCase = new UserRoleUseCase(userRoleRepository)

const userRoleController = new UserRoleController(userRoleUseCase);

router.use(authMiddleware.protect);
router.post('/',(req,res)=>userRoleController.addUserRole(req,res));
router.patch('/:id',(req,res)=>userRoleController.updateUserRole(req,res));
router.delete("/:id",(req,res)=>userRoleController.deletedRole(req,res));
router.patch('/:id/active',(req,res)=>userRoleController.activateUserRole(req,res));
router.get('/:id',(req,res)=>userRoleController.getUserRoleById(req,res));
router.post('/table',(req,res)=>userRoleController.getUserRolesTable(req,res));
router.get('/',(req,res)=>userRoleController.getAllUserRoles(req,res));
// router.get('/branch/:branchId',(req,res)=>userRoleController.getByBranchId(req,res));
// router.post('/alluserrole',(req,res)=>userRoleController.getAllUserRoleSetting(req,res))

export default router;