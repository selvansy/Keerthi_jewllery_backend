import express from 'express';
import ProductController from '../../../controllers/chit/admin/client/productController.js';
import ProductRepository from '../../../../infrastructure/repositories/chit/productRepository.js';
import ProductUseCase from '../../../../usecases/auth/chit/client/productUseCase.js';
import S3Service from '../../../../utils/s3Bucket.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../../utils/jwtToken.js';
import { upload } from "../../../../utils/multer.js";
import ProductValidator from '../../../../utils/validations/productValidator.js';
import BranchRepository from '../../../../infrastructure/repositories/chit/brachRepository.js';
import MetalRepository from '../../../../infrastructure/repositories/chit/MetalRepository.js';
import CategoryRepository from '../../../../infrastructure/repositories/chit/categoryRepository.js';
import purityReporsitory from '../../../../infrastructure/repositories/chit/purityReporsitory.js';
import MetalRateRepository from '../../../../infrastructure/repositories/chit/metalRateRepository.js';
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
const router = express.Router();

const validator=new ProductValidator()
const tokenService=new TokenService()
const s3Service=new S3Service()
const productRepository=new ProductRepository()
const brachRepository=new BranchRepository()
const metalRepository=new MetalRepository()
const categoryRepository=new CategoryRepository()
const purityRepository= new purityReporsitory()
const metalRateRepository=new MetalRateRepository()
const s3Repo = new S3BucketRepository()
const authMiddleware=new AuthMiddleware(tokenService)
const usecase=new ProductUseCase(productRepository,brachRepository,metalRepository,categoryRepository,purityRepository,metalRateRepository,s3Service
    ,s3Repo
)
const controller=new ProductController(usecase,validator)


router.use(authMiddleware.protect);
router.post('/table',(req,res)=>controller.allProducts(req,res))
router.get('/:id',(req,res)=>controller.ProductById(req,res))
router.get('/branch/:id',(req,res)=>controller.ProductByBranchId(req,res))
router.post('/',upload.handleUpload([{name:"product_image",maxCount:3}]),(req, res) => controller.addProduct(req, res));
router.patch('/:id',upload.handleUpload([{name:"product_image",maxCount:3}]),(req, res) => controller.editProduct(req, res));
router.patch('/:id/active',(req,res)=>controller.changeStatus(req,res))
router.delete('/:id',(req,res)=>controller.deleteProduct(req,res))


export default router;