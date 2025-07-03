import express from 'express';
import WhatsappMessageRepository from '../../../../infrastructure/repositories/chit/whatsapppMessageRespository.js';
import WhatsappMessageUsecas from '../../../../usecases/auth/chit/client/whatsappMessageUseCase.js';
import WhatsappMessgeController from '../../../controllers/chit/admin/client/whatsappMessageController.js';
import TokenService from '../.../../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../.../../utils/middleware/authMiddleware.js'
import CustomerRepository from '../../../../infrastructure/repositories/chit/CustomerRepository.js';
import ConfigurationRespository from '../../../../infrastructure/repositories/chit/super/configurationRepository.js'
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
import NotificationRepository from '../../../../infrastructure/repositories/chit/super/notificationRepository.js'
import ProductRespository from '../../../../infrastructure/repositories/chit/productRepository.js'
import NewArrivalsRepository from '../../../../infrastructure/repositories/chit/newArrivalsRepository.js'
import OffersRepository from '../../../../infrastructure/repositories/chit/offerRepository.js';
import WhatsAppRepository from '../../../../infrastructure/repositories/chit/super/whatsappRepository.js';
import ProductUseCase from '../../../../usecases/auth/chit/client/productUseCase.js';
import NewArrivalUseCase from '../../../../usecases/auth/chit/client/newArrivalsUsecase.js';
import OfferUseCase from '../../../../usecases/auth/chit/client/offerUseCase.js';


const router = express.Router()

const whatsappMsgRepo = new WhatsappMessageRepository();
const productRepo = new ProductRespository()
const newArrivalRepo =new NewArrivalsRepository();
const offersRepo = new OffersRepository()
const customerRepo = new CustomerRepository();
const s3bucketRepo = new S3BucketRepository();
const whatsappSettingRepo = new WhatsAppRepository ()
const configurationRespo = new ConfigurationRespository()
const notificationRepository = new NotificationRepository()

//dependency usecases
const productUsecase = new ProductUseCase();
const newArrivalUsecase = new NewArrivalUseCase();
const offerUseCase = new OfferUseCase()

const whatappMsgUseCase = new WhatsappMessageUsecas(whatsappMsgRepo,
    customerRepo,configurationRespo,notificationRepository,s3bucketRepo,
    productRepo,newArrivalRepo,offersRepo,whatsappSettingRepo,productUsecase,newArrivalUsecase,offerUseCase
)
const tokenService = new TokenService()
const authMiddleware = new AuthMiddleware(tokenService)

const whatsappMsgController  = new WhatsappMessgeController(whatappMsgUseCase)

router.use(authMiddleware.protect)
router.post('/',(req,res)=>whatsappMsgController.sendWhatsappMessage(req,res));
router.delete('/:id',(req,res)=>whatsappMsgController.deleteWhatsappMessage(req,res))


export default router;