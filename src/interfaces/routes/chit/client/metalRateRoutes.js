import express from 'express';
import metalRateController from '../../../controllers/chit/admin/client/metalRateController.js';
import metalRateUseCase from '../../../../usecases/auth/chit/client/metalRateUseCase.js';
import MetalRateRepository from '../../../../infrastructure/repositories/chit/metalRateRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/metalRateValidator.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import MetalRepository from '../../../../infrastructure/repositories/chit/MetalRepository.js';

const router= express.Router();

const tokernService= new TokenService();
const validator= new Validator()
const authMiddleware= new AuthMiddleware(tokernService);

const metalrateRepository= new MetalRateRepository();
const metalRepo = new MetalRepository()
const metalrateUseCase= new metalRateUseCase(metalrateRepository,metalRepo)

const metalrateContorller= new metalRateController(metalrateUseCase,validator);


router.get('/current',authMiddleware.protect, (req, res) => metalrateContorller.todaysMetalRateByMetal(req, res));
router.get('/current-previous/:branchId', (req, res) => metalrateContorller.currenPreviousMetalRate(req, res));
router.get('/:id',(req,res)=>metalrateContorller.getById(req,res))
router.get('/today-rate/:branchId/date/:date', (req, res) => metalrateContorller.todaysMetalRate(req, res)); //! metal rate api don't modify it
router.post('/table', (req, res) => metalrateContorller.metalRateTable(req, res));
router.use(authMiddleware.protect);
router.post('/', (req, res) => metalrateContorller.addMetalRate(req, res));
router.patch('/:id', (req, res) => metalrateContorller.editMetalRate(req, res));
router.delete('/:id', (req, res) => metalrateContorller.deleteMetalRate(req, res));
router.get('/today-rate/branchId/:branchId', (req, res) => metalrateContorller.metalRatetoday(req, res));

export default router;