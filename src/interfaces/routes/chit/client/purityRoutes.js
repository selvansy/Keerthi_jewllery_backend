import express from 'express';
import PurityController from '../../../controllers/chit/admin/client/purityController.js';
import PurityUseCase from '../../../../usecases/auth/chit/client/purityUseCases.js';
import PuriytRepository from '../../../../infrastructure/repositories/chit/purityReporsitory.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import Validator from '../../../../utils/validations/purityValidations.js';
import MetalRateRepository from '../../../../infrastructure/repositories/chit/metalRateRepository.js';


const router= express.Router();

const purityReporsitory= new  PuriytRepository();
const metalRateRepo = new MetalRateRepository()
const purityUseCases= new  PurityUseCase(purityReporsitory,metalRateRepo);

const toekSerivice= new  TokenService();
const authMiddleware= new AuthMiddleware(toekSerivice);
const validator= new Validator()

const purityController= new PurityController(purityUseCases,validator)

router.post("/table",(req,res)=>purityController.puityTable(req,res));
router.get("/",(req,res)=>purityController.getAllPurity(req,res));
router.get('/:id',(req,res)=>purityController.getPurityById(req,res));
router.use(authMiddleware.protect);
router.post('/',(req,res)=>purityController.addPurity(req,res));
router.patch('/:id',(req,res)=>purityController.updatePurity(req,res));
router.patch('/:id/active',(req,res)=>purityController.activatePurity(req,res));
router.delete('/:id',(req,res)=>purityController.deletePurity(req,res));
router.patch('/:id/display',(req,res)=>purityController.purityDisplaySettings(req,res));
router.get('/metal/:id',(req,res)=>purityController.getPurityByMetalId(req,res))

export default router;