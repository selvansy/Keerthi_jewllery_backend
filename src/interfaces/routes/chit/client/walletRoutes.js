import express from "express";
import WalletController from "../../../controllers/chit/admin/client/walletController.js";
import WalletRepository from "../../../../infrastructure/repositories/chit/walletRepository.js";
import WalletUsecase from "../../../../usecases/auth/chit/client/walletUsecase.js";
import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import BranchRepository from "../../../../infrastructure/repositories/chit/brachRepository.js";


const router  = express.Router();

const walletRepo = new WalletRepository();
const branchRepo = new BranchRepository();
const walletUsecase = new WalletUsecase(walletRepo,branchRepo);
const walletController = new WalletController(walletUsecase);
const tokenService  = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

router.use(authMiddleware.protect);
router.get('/history',(req,res)=>walletController.getWalletHistoryByWalletId(req,res));
// router.post('/rate',(req,res)=>walletController.addWalletRate(req,res));
// router.get('/get-rate',(req,res)=>walletController.getWalletRate(req,res));
// router.patch('/:id/redeem',(req,res)=>walletController.redeemFromWallet(req,res));
router.post('/table',(req,res)=>walletController.getAllWallets(req,res));
router.post('/redeemtable',(req,res)=>walletController.getRedeem(req,res));
router.patch('/ratet/:id/active',(req,res)=>walletController.activateWalletRate(req,res));
router.post ('/',(req,res)=>walletController.addWallet(req,res));
router.patch('/:id/add',(req,res)=>walletController.addBalanceToWallet(req,res));
router.post('/redeem',(req,res)=>walletController.redeemFromWallet(req,res));
router.patch('/:id/active',(req,res)=>walletController.activateWallet(req,res));
router.delete('/:id',(req,res)=>walletController.deletedWallet(req,res));

router.get('/customer-details',(req,res)=>walletController.getCustomerWalletDetails(req,res)); //! get customer wallet details for wallet redeem details
router.get('/mobile',(req,res)=>walletController.getWalletDataByMobile(req,res));
router.post('/user/redeemData',(req,res)=>walletController.getRedeemByUser(req,res));
router.post('/refferal-list/user',(req,res)=>walletController.getRefferalListByUser(req,res));
router.post('/refferal-list/payment/:id',(req,res)=>walletController.getRefferalPayment(req,res));

//!api for mobile
router.get('/',(req,res)=>walletController.getWalletData(req,res));


export default router;