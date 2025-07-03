import express, { json } from 'express';
import ProjectAccessController from '../../../controllers/chit/admin/super/projectAccessController.js';
import ProjectAccessRepository from '../../../../infrastructure/repositories/chit/super/projectAccessRepository.js';
import ProjectAccessUseCase from '../../../../usecases/auth/chit/admin/projectAccessUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';

const router = express.Router();

const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService)
const projectAccessRepository = new ProjectAccessRepository();
const projectAccessUseCase = new ProjectAccessUseCase(projectAccessRepository);

const projectAccessController = new ProjectAccessController(projectAccessUseCase);

router.use(authMiddleware.protect)
router.post('/',(req,res)=>projectAccessController.addProjectAccess(req,res));
router.patch('/:id',(req,res)=>projectAccessController.updateProjectAccess(req,res));
router.delete('/:id',(req,res)=>projectAccessController.deleteProjectAccess(req,res));
router.patch('/:id/active',(req,res)=>projectAccessController.activateProjectAccess(req,res));
router.get('/:id',(req,res)=>projectAccessController.getProjectAccessById(req,res));
router.get('/',(req,res)=>projectAccessController.getAllActiveProjectAccess(req,res));
router.post('/table',(req,res)=>projectAccessController.projectAccessTable(req,res));
router.get('/client/:clientId',(req,res)=>projectAccessController.getBranchByClientId(req,res))


export default router;