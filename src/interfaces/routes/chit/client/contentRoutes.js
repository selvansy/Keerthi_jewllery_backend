import express from 'express';

import ContentRepo from '../../../../infrastructure/repositories/chit/contentRepo.js';
import ContentManagementController from '../../../controllers/chit/admin/client/ContentController.js';
import ContentUseCase from '../../../../usecases/auth/chit/client/ContentUseCase.js';
import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";

const router = express.Router();

const contentRepo = new ContentRepo();
const contentUseCase = new ContentUseCase(contentRepo);
const contentController = new ContentManagementController(contentUseCase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

router.get('/all/type/:id', (req, res) => contentController.getContentTypes(req, res)); 
router.use(authMiddleware.protect); 

router.post('/add', (req, res) => contentController.createContent(req, res)); 
router.get('/all', (req, res) => contentController.getAllContent(req, res)); 
router.get('/:id', (req, res) => contentController.getContentById(req, res)); 
router.patch('/update/:id', (req, res) => contentController.updateContent(req, res)); 
router.delete('/:id', (req, res) => contentController.deleteContent(req, res)); 

export default router;
