import express from "express";
import OfferRepository from "../../../../infrastructure/repositories/chit/offerRepository.js";
import OfferController from "../../../controllers/chit/admin/client/offerController.js";
import OfferUseCase from "../../../../usecases/auth/chit/client/offerUseCase.js";
import { upload } from "../../../../utils/multer.js";
import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import OfferValidator from "../../../../utils/validations/offerValidator.js";
import S3Service from "../../../../utils/s3Bucket.js";
import S3BucketRepository from "../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js";

const offerRepository = new OfferRepository();
const s3Service=new S3Service()
const s3repo =new S3BucketRepository()
const offerUseCase = new OfferUseCase(offerRepository,s3Service,s3repo);
const tokenService= new TokenService();
const authMiddleware= new AuthMiddleware(tokenService);
const offerValidator = new OfferValidator()

const offerController = new OfferController(offerUseCase,offerValidator);


const router = express.Router();


router.use(authMiddleware.protect);

router.post('/table',(req,res)=>offerController.getAllOffers(req,res));
router.get('/:id',(req,res)=>offerController.getOfferById(req,res));
router.get('/branch/:id',(req,res)=>offerController.getOfferByBranchId(req,res));
router.post("/",upload.handleUpload([{ name: 'offer_image', maxCount: 3 }]), (req, res) => offerController.addoffer(req, res));
router.patch("/:id",upload.handleUpload([{ name: 'offer_image', maxCount: 3 }]), (req, res) => offerController.editOffer(req, res));
router.patch("/:id/active",(req,res)=>offerController.changeStatus(req,res))
router.delete("/:id",(req, res) => offerController.deleteOffer(req, res));


export default router;
