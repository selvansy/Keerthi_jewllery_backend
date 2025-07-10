import express from "express";
import { upload } from "../../../../utils/multer.js";
import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import S3Service from "../../../../utils/s3Bucket.js";
import NewArrivalsController from "../../../controllers/chit/admin/client/newArrivalsController.js";
import NewArrivalUseCase from "../../../../usecases/auth/chit/client/newArrivalsUsecase.js";
import NewArrivalRepository from "../../../../infrastructure/repositories/chit/newArrivalsRepository.js";
import NewArrivalsValidation from "../../../../utils/validations/newArrivalsValidation.js";
import BranchRepository from "../../../../infrastructure/repositories/chit/brachRepository.js";
import S3BucketRepository from "../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js";



const router = express.Router();
const tokenService= new TokenService();
const brachRepository=new BranchRepository()
const authMiddleware= new AuthMiddleware(tokenService);
const s3service=new S3Service()
const s3repo =new S3BucketRepository()
const repository=new NewArrivalRepository()
const validator=new NewArrivalsValidation()


const useCase=new NewArrivalUseCase(repository,brachRepository,s3service,s3repo)
const controller=new NewArrivalsController(useCase,validator)


router.use(authMiddleware.protect);

//upload.handleUpload([{ name: 'new_arrivals_img', maxCount: 1 }])
router.post('/table',(req,res)=>controller.getNewArrivals(req,res))
router.get('/branch/:id',(req,res)=>controller.getNewArrivalsByBranch(req,res))
router.get('/:id',(req,res)=>controller.getNewArrivalsById(req,res))
router.post('/',(req,res)=>controller.addNewArrivals(req,res))
router.patch('/:id',(req,res)=>controller.editNewArrivals(req,res))
router.patch('/:id/active',(req,res)=>controller.changeStatus(req,res))
router.delete('/:id',(req,res)=>controller.deleteNewArrivals(req,res))


// router.post("/",upload.handleUpload([{ name: 'offer_image', maxCount: 10 }]), (req, res) => offerController.addoffer(req, res));
export default router;
