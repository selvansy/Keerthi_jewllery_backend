import express from 'express';
import GiftIssuesController from '../../../controllers/chit/admin/client/giftIssuesController.js';
import GiftIssuesUseCase from '../../../../usecases/auth/chit/client/giftIssuesUseCase.js';
import GiftIssuesRepository from '../../../../infrastructure/repositories/chit/giftIssuesRepository.js';
import SchemeAccountRepository from '../../../../infrastructure/repositories/chit/schemeAccountRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/giftValidator.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import GiftInwardsRepo from '../../../../infrastructure/repositories//chit/giftInwardsRepository.js'
import giftItemRepository from '../../../../infrastructure/repositories/chit/giftItemRepository.js';
import CustomerRepository from '../../../../infrastructure/repositories/chit/CustomerRepository.js';

const router= express.Router();
const tokenService= new TokenService();
const validator = new Validator()
const authMiddleware= new AuthMiddleware(tokenService);

const giftIssuesRepository= new GiftIssuesRepository();
const giftInwardsRepo = new GiftInwardsRepo()
const giftItemRepo = new giftItemRepository()
const schemeAccountRepository= new SchemeAccountRepository();
const customerRepository = new CustomerRepository()
const giftIssuesUseCase= new GiftIssuesUseCase(giftIssuesRepository,giftInwardsRepo,giftItemRepo,schemeAccountRepository,customerRepository);

const giftIssuesController= new GiftIssuesController(giftIssuesUseCase,validator)

router.use(authMiddleware.protect);
router.post('/',(req,res)=>giftIssuesController.addGiftIssue(req,res));
router.delete('/:id',(req,res)=>giftIssuesController.deleteGiftIssue(req,res));
router.get('/:id',(req,res)=>giftIssuesController.getGiftIssueById(req,res));
router.get('/branch/:branchId',(req,res)=>giftIssuesController.getGiftIssuesByBranch(req,res));
router.get('/',(req,res)=>giftIssuesController.getAllActiveIssues(req,res));
router.post('/branch/:id/barcode',(req,res)=>giftIssuesController.searchBarcode(req,res));
router.post('/table',(req,res)=>giftIssuesController.giftIssuesDataTable(req,res))
router.get('/branch/:branchId/count',(req,res)=>giftIssuesController.giftAccounntCount(req,res))
router.post('/cards',(req,res)=>giftIssuesController.getCardsData(req,res))
router.post('/schemeaccount/:value',(req,res)=>giftIssuesController.giftIssueDataByschemeaccId(req,res))

export default router;