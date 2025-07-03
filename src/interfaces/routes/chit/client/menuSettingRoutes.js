import express from 'express';
import MenuController from '../../../controllers/chit/admin/client/menuController.js';
import MenuUseCase from '../../../../usecases/auth/chit/client/MenuUseCase.js';
import MenuRepository from '../../../../infrastructure/repositories/chit/MenuRepository.js';
import TokenService from '../../../../utils/jwtToken.js';
import Validator from '../../../../utils/validations/validation.js';
import AuthMiddleware  from '../../../../utils/middleware/authMiddleware.js';
// import S3Service from '../../../../utils/s3Bucket.js';
import menuIconUploader from '../../../../utils/menuIconUploader.js';
const router = express.Router();

const tokenService= new TokenService();
const validator = new Validator()
const authMiddleware= new AuthMiddleware(tokenService)
// const s3service= new S3Service();

const menuRepository= new MenuRepository();
const menuUseCase= new MenuUseCase(menuRepository);

const menuController= new MenuController(menuUseCase,validator);


router.post('/allmenu',(req,res)=>menuController.getAllActiveMenuSettings(req,res));
router.get('/:id',(req,res)=>menuController.getMenuById(req,res));
router.use(authMiddleware.protect);
router.post('/',menuIconUploader.handleMenuIconUpload(),(req,res)=>menuController.addMenuSetting(req,res));
router.patch('/:id',menuIconUploader.handleMenuIconUpload(),authMiddleware.protect,(req,res)=>menuController.editMenuSetting(req,res));
router.delete('/:id',authMiddleware.protect,(req,res)=>menuController.deleteMenuSetting(req,res));
router.patch('/:id/active',authMiddleware.protect,(req,res)=>menuController.changeMenuActiveStatus(req,res));
router.get('/',(req,res)=>menuController.getAllMenu(req,res));

export default router;