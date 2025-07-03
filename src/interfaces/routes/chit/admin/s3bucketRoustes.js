import express from 'express';
import S3BucketController from '../../../controllers/chit/admin/super/s3bucketController.js';
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
import S3BucketUseCase from '../../../../usecases/auth/chit/admin/s3bucketUseCase.js';
import TokenService from '../../../../utils/jwtToken.js';
import AuthMiddleware from '../../../../utils/middleware/authMiddleware.js';

const router = express.Router();

const s3bucketRepository = new S3BucketRepository();
const s3bucketUseCase = new S3BucketUseCase(s3bucketRepository);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


const s3bucketController = new S3BucketController(s3bucketUseCase);

router.use(authMiddleware.protect);

router.post('/', (req, res) => s3bucketController.addSetting(req, res));
router.get('/project/:projectId/branch/:branchId', (req, res) => s3bucketController.getByProjectAndBranch(req, res));
router.get('/branch/:branchId',(req,res)=>s3bucketController.getByBranch(req,res))

export default router;