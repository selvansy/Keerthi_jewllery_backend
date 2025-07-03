import express from "express";
import giftItemCotroller from "../../../controllers/chit/admin/client/giftItemController.js";
import giftItemUseCase from "../../../../usecases/auth/chit/client/giftItemUseCase.js";
import GiftItemRepository from "../../../../infrastructure/repositories/chit/giftItemRepository.js";
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/giftValidator.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
import S3Service from '../../../../utils/s3Bucket.js';
import {upload} from '../../../../utils/multer.js';
import S3BucketRepository from "../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js";


const router = express.Router();

const tokenService= new TokenService();
const validator = new Validator()
const authMiddleware= new AuthMiddleware(tokenService)
const s3service= new S3Service();
const s3Repo = new S3BucketRepository()

const giftitemRepository= new GiftItemRepository();
const giftitemUseCase= new giftItemUseCase(giftitemRepository,s3service,s3Repo);

const giftItemController= new giftItemCotroller(giftitemUseCase,validator)

router.post('/table',(req,res)=>giftItemController.getAllActiveGiftItems(req,res));
router.get('/branch/:id',(req,res)=>giftItemController.getGiftItemByBranch(req,res));
router.get('/vendor/:id',(req,res)=>giftItemController.getGiftItemByVendor(req,res));
router.get('/:id',(req,res)=>giftItemController.getGiftItemById(req,res));
router.use(authMiddleware.protect);
router.post('/',upload.handleUpload([{ name: 'gift_image', maxCount: 1 }]),(req,res)=>giftItemController.addGiftItem(req,res));
router.patch('/:id',upload.handleUpload([{ name: 'gift_image', maxCount: 1 }]),(req,res)=>giftItemController.editGiftItem(req,res));
router.patch('/:id/active',(req,res)=>giftItemController.changeGiftItemActiveState(req,res));
router.delete('/:id',(req,res)=>giftItemController.deleteGift(req,res));

export default router;