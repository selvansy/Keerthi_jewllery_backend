import express from 'express';
import giftInwardsController from '../../../controllers/chit/admin/client/giftInwardsController.js';
import giftInwardsRepository from '../../../../infrastructure/repositories/chit/giftInwardsRepository.js';
import giftInwardsUseCase from '../../../../usecases/auth/chit/client/giftInwardsUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/giftValidator.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';

const router= express.Router();

const tokernService= new TokenService();
const validator= new Validator()
const authMiddleware= new AuthMiddleware(tokernService);

const giftinwardsRepository= new giftInwardsRepository();
const giftinwardsUseCase= new giftInwardsUseCase(giftinwardsRepository);

const giftinwardsController = new giftInwardsController(giftinwardsUseCase,validator);

router.post('/table',(req,res)=>giftinwardsController.giftInwardsDataTable(req,res));
router.use(authMiddleware.protect)
router.post('/',(req,res)=>giftinwardsController.addGiftInward(req,res));
router.patch('/:id',(req,res)=>giftinwardsController.editGiftInward(req,res));
router.delete('/:id',(req,res)=>giftinwardsController.deleteGiftInward(req,res));
router.patch('/:id/active',(req,res)=>giftinwardsController.changeInwardsActiveStatus(req,res));
router.get('/:id',(req,res)=>giftinwardsController.getGiftInwardsById(req,res));
router.get('/branch/:branchId',(req,res)=>giftinwardsController.getGiftInwardsByBranch(req,res));
// router.get('/all',(req,res)=>giftinwardsController.getAllActiveInwards(req,res))


export default router;