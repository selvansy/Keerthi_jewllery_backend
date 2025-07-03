import express from 'express';
import AuthController from '../../../controllers/chit/admin/AuthController.js';
import MongoUserRepository from '../../../../infrastructure/repositories/chit/MongoUserRepository.js';
import HashingService from '../../../../utils/bcrypt.js';
import TokenService from '../../../../utils/jwtToken.js';
import LoginUsecase from '../../../../usecases/auth/chit/admin/LoginUseCase.js'
import LayoutRepository from '../../../../infrastructure/repositories/chit/super/layoutSettingRepository.js';
import UserAccessRepository from '../../../../infrastructure/repositories/chit/userAccessRepository.js';

const router = express.Router();
const hashingService= new HashingService();
const tokenService= new TokenService ();
const userRepository = new MongoUserRepository();
const layoutRepository = new LayoutRepository()
const userAccessRepo = new UserAccessRepository()
const loginUseCase=new LoginUsecase(userRepository,hashingService,tokenService,layoutRepository,userAccessRepo);

const authController = new AuthController(loginUseCase);

router.post('/login', (req, res) => authController.login(req, res));

export default router; 