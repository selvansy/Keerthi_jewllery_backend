import express from 'express';
import giftVendorUseCase from '../../../../usecases/auth/chit/client/giftVendorUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/giftValidator.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import giftVendorRepository from '../../../../infrastructure/repositories/chit/giftVendorRepository.js';
import giftVendorController from '../../../controllers/chit/admin/client/giftVendorController.js';
const router = express.Router();

const tokenService= new TokenService();
const validator = new Validator()
const authMiddleware= new AuthMiddleware(tokenService);

const giftVendorRepositroy= new giftVendorRepository();
const giftvendorUseCase= new giftVendorUseCase(giftVendorRepositroy);

const giftvendorController= new giftVendorController(giftvendorUseCase,validator)


router.post('/table',(req,res)=>giftvendorController.allVendorsDataTable(req,res));
router.get('/',(req,res)=>giftvendorController.getAllActiveVendors(req,res));
router.get('/branch/:id',(req,res)=>giftvendorController.getGiftVendorByBranch(req,res));
router.get('/:id',(req,res)=>giftvendorController.getGiftItemById(req,res));
router.use(authMiddleware.protect);
router.post('/',(req,res)=>giftvendorController.addGiftVendor(req,res));
router.patch('/:id',(req,res)=>giftvendorController.editGiftVendor(req,res));
router.patch('/:id/active',(req,res)=>giftvendorController.changeVendorActiveState(req,res));
router.delete('/:id',(req,res)=>giftvendorController.deleteVendor(req,res));

export default router;