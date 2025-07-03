import express from 'express';

import faqController from '../../../controllers/chit/admin/client/faqController.js';
import faqRepo from '../../../../infrastructure/repositories/chit/faqRepo.js';
import faqUseCase from '../../../../usecases/auth/chit/client/faqUseCase.js';

import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";

const router = express.Router();

const faqRepos = new faqRepo();
const faqUseCases = new faqUseCase(faqRepos);
const faqControllers = new faqController(faqUseCases);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

router.use(authMiddleware.protect); 

router.post('/add', (req, res) => faqControllers.createfaq(req, res)); 
router.post('/all/', (req, res) => faqControllers.getAllfaq(req, res)); 
router.get('/:id', (req, res) => faqControllers.getfaqByUser(req, res)); 
router.patch('/update/:id', (req, res) => faqControllers.updatefaq(req, res)); 
router.delete('/:id', (req, res) => faqControllers.deletefaq(req, res)); 

export default router;
