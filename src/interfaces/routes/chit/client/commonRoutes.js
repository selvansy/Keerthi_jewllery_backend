import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import CommonUseCase from "../../../../usecases/auth/chit/client/commonUseCase.js";
import CommonController from "../../../controllers/chit/admin/client/commonController.js";
import CommonRepository from "../../../../infrastructure/repositories/chit/super/commonRepository.js";


const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

const commonRepository = new CommonRepository()
const commonUseCase=new CommonUseCase(commonRepository)

const commonController=new CommonController(commonUseCase)

const router = express.Router();

router.get('/city/:stateId',(req,res)=>commonController.getCity(req,res))
router.get('/state/:countryId',(req,res)=>commonController.getStates(req,res))
router.get('/country',(req,res)=>commonController.getCountries(req,res))
router.get('/relationship',(req,res)=>commonController.getAllRelationships(req,res))
router.get('/gender',(req,res)=>commonController.getAllGender(req,res))

//! app version check, add, update api section (do not modify with proper understanding)
//*for mobile
router.get('/check',(req,res)=>commonController.checkAppVersion(req,res));

router.use(authMiddleware.protect);
router.get('/wastagetype',(req,res)=>commonController.getAllWastagetype(req,res))
router.get('/makingcharge',(req,res)=>commonController.getAllmakingcharge(req,res))
router.get('/displaytype',(req,res)=>commonController.displaytype(req,res))
router.get('/showtype',(req,res)=>commonController.getAllShowType(req,res))
router.get('/typeway',(req,res)=>commonController.getAlltypeway(req,res))
router.get('/classifytype',(req,res)=>commonController.getAllClassifyType(req,res))
router.get('/printtype',(req,res)=>commonController.getAllPrintType(req,res))
router.get('/accountnotype',(req,res)=>commonController.getAllAccountNotype(req,res))
router.get('/closeprinttype',(req,res)=>commonController.getAllClosePrintType(req,res))
router.get('/referralcalculation',(req,res)=>commonController.getReferralCalculation(req,res))
router.get('/receipttype',(req,res)=>commonController.getReceiptType(req,res))
router.get('/smsaccesstype',(req,res)=>commonController.getSmsAccessType(req,res))
router.get('/whatsapptype',(req,res)=>commonController.getWhatsappType(req,res))
router.get('/paymenttype',(req,res)=>commonController.getPaymentType(req,res))
router.get('/fundtype',(req,res)=>commonController.getFundType(req,res))
// router.get('/buygsttype',(req,res)=>commonController.getBuyGstType(req,res))
router.get('/layouttype',(req,res)=>commonController.getLayoutType(req,res))
router.get('/addedtype',(req,res)=>commonController.addedType(req,res))
router.get('/giftissuetype',(req,res)=>commonController.giftIssueType(req,res))
router.get('/offerstype',(req,res)=>commonController.offersType(req,res))
router.get('/displayselltype',(req,res)=>commonController.displaySellType(req,res))
router.get('/notificationtype',(req,res)=>commonController.notificationType(req,res))
router.get('/multipaymentmode',(req,res)=>commonController.multiPaymentmode(req,res))
router.get('/metal',(req,res)=>commonController.getAllMetal(req,res))
router.get('/purity',(req,res)=>commonController.getAllPurity(req,res))
router.get('/paymentmodes',(req,res)=>commonController.getAllPaymentMode(req,res))
router.get('/paymentstatus',(req,res)=>commonController.getAllPaymentStatus(req,res))
router.get('/schemestatus',(req,res)=>commonController.getAllSchemeStatus(req,res))
router.get('/installmenttype',(req,res)=>commonController.getAllInstallmentType(req,res))
router.get('/purity/:metalId',(req,res)=>commonController.getPurityByMetal(req,res))
router.get('/redeem-type',(req,res)=>commonController.getRedeemType(req,res))
router.get('/content-type',(req,res)=>commonController.getContentType(req,res))
router.get('/faq-category',(req,res)=>commonController.getFaqCategories(req,res))


//!for superadmin to access,add, update the app update related data
router.post("/add",(req,res)=>commonController.addAppVersionData(req,res));


export default router;
