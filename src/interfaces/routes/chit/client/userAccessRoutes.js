import express from 'express';
import UseAccessController from '../../../controllers/chit/admin/client/useAccessController.js';
import UserAccessUseCase from '../../../../usecases/auth/chit/client/userAccessUseCase.js';
import UserAccessRepository from '../../../../infrastructure/repositories/chit/userAccessRepository.js';
import SubMenuRepository from '../../../../infrastructure/repositories/chit/subMenuRepository.js';
import MenuRepository from '../../../../infrastructure/repositories/chit/MenuRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';


const router = express.Router()
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

const useraccessRepository = new UserAccessRepository();
const submenuRepository = new SubMenuRepository()
const menuRepository = new MenuRepository()
const useraccessUseCase = new UserAccessUseCase(useraccessRepository,submenuRepository,menuRepository);

const useraccessContoller = new UseAccessController(useraccessUseCase)

router.use(authMiddleware.protect)
router.patch('/:roleId',(req,res)=>useraccessContoller.updateMenuPermission(req,res));
// router.get('/access/:roleId',(req,res)=>useraccessContoller.getUserAccess(req,res));
router.get('/permissions/:roleId',(req,res)=>useraccessContoller.getUserPrermission(req,res));
router.get('/menu/:roleId',(req,res)=>useraccessContoller.getActiveMenuAccess(req,res))



export default router;