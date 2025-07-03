import express from 'express';
import AdminController from '../../../controllers/chit/admin/AdminController.js';
import AdminRepository from "../../../../infrastructure/repositories/chit/AdminRepository.js"
import ClientRepository from '../../../../infrastructure/repositories/chit/ClientRepository.js';
import AdminUseCase from "../../../../usecases/auth/chit/admin/AdminUseCase.js";
import ClientUseCase from '../../../../usecases/auth/chit/admin/clientUseCase.js';
import ProjectRepository from '../../../../infrastructure/repositories/chit/ProjectRepository.js';
import ProjectUsecase from '../../../../usecases/auth/chit/admin/projectUseCase.js';
import AppSettingRepository from '../../../../infrastructure/repositories/chit/AppSettingRepository.js';
import AppSettingUseCase from '../../../../usecases/auth/chit/admin/AppSettingUseCase.js';
import BranchRepository from '../../../../infrastructure/repositories/chit/brachRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import HashingService from '../../../../utils/bcrypt.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js'
import whatssappRoutes from '../admin/whatsappRoutes.js'
import projectAccessRoutes from './projectAccessRoutes.js'
import configurtionRoutes from "./configurationRoutes.js";
import notificationRoutes from './notificatonSettinRoutes.js';
import generalSettingRoutes from './generalSettingRoutes.js';
import smssettingRoutes from './smsSettingRoutes.js'
import whatsappRoutes from './whatsappRoutes.js';
import gatewayRoutes from './gatewayRoutes.js';
import s3bucketRoutes from './s3bucketRoustes.js';
import layoutSettingRoutes from './layoutSettingRoutes.js'

const router = express.Router();
const hashingService= new HashingService();
const tokenService= new TokenService();
const authMiddleware= new AuthMiddleware(tokenService)
const adminRepository = new AdminRepository();
const projectRepository= new ProjectRepository();
const clientRepository= new ClientRepository();
const appsettingRepository= new AppSettingRepository();
const branchRepository= new BranchRepository();
const projectUseCase= new ProjectUsecase(projectRepository,clientRepository);
const adminUseCase= new AdminUseCase(adminRepository,hashingService,tokenService);
const clientUsecase= new ClientUseCase(clientRepository,projectUseCase);
const appsettingUseCase= new AppSettingUseCase(appsettingRepository,branchRepository);



const adminController = new AdminController(adminUseCase,clientUsecase,projectUseCase,appsettingUseCase);

router.post('/login', (req, res) => adminController.login(req, res));
router.post('/register',(req,res)=>adminController.addNewAdmin(req,res));
router.patch('/:id',(req,res)=>adminController.changeActiveState(req,res));
router.delete('/:id',(req,res)=> adminController.deleteAdmin(req,res));

//add client
router.post('/client',(req,res)=>adminController.addClient(req,res));
router.patch('/client/:id',(req,res)=>adminController.updateClient(req,res));
router.delete('/client/:id',(req,res)=>adminController.deleteClient(req,res));
router.post('/client/table',(req,res)=>adminController.clientTable(req,res));
router.patch('/client/:id/active',(req,res)=>adminController.activateClient(req,res))
router.get('/client/:id',(req,res)=>adminController.getClientById(req,res));
router.get('/client',(req,res)=>adminController.getAllClients(req,res));



//project
router.post('/projects',(req,res)=>adminController.addProject(req,res));
router.patch('/projects/:id',(req,res)=>adminController.updateProject(req,res));
router.delete('/projects/:id',(req,res)=>adminController.deleteProject(req,res));
router.post('/projects/table',(req,res)=>adminController.getAllActiveProjects(req,res));
router.get('/projects/:id',(req,res)=>adminController.getProjectById(req,res));
router.patch('/projects/:id/active',(req,res)=>adminController.toggleProjectStatus(req,res));
router.get('/projects',(req,res)=>adminController.getAllProjects(req,res));
router.get('/projects/client/:clientId',(req,res)=>adminController.getProjectByClient(req,res))

//app setting
router.post('/appsetting',authMiddleware.protect,(req,res)=>adminController.addAppSetting(req,res));
router.patch('/appsetting/:id',(req,res)=>adminController.updataAppSetting(req,res));
router.get('/appsetting/:id',(req,res)=>adminController.getAppSettingById(req,res));
router.get('/appsetting/branch/:id',(req,res)=>adminController.getAppSettingByBranchId(req,res));
router.get('/appsetting/project/:projectId/branch/:branchId',(req,res)=>adminController.getAppSettingByProjectAndBranch(req,res));
router.post('/appsetting/table',(req,res)=>adminController.getAllAppSettings(req,res));
// router.delete('/appsetting/:id',(req,res)=>adminController.deleteAppSetting(req,res));

router.use('/whatsapp',whatssappRoutes);
router.use('/projectaccess',projectAccessRoutes);
router.use('/configuration',configurtionRoutes);
router.use('/notificationsetting',notificationRoutes);
router.use('/generalsetting',generalSettingRoutes);
router.use('/smssetting',smssettingRoutes)
router.use('/whatsappsetting',whatsappRoutes);
router.use('/gatewaysetting',gatewayRoutes);
router.use('/bucketsetting',s3bucketRoutes);
router.use('/layoutsetting',layoutSettingRoutes)


export default router;