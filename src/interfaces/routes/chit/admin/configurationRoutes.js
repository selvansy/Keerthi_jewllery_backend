import express from 'express';
import BranchRepository from '../../../../infrastructure/repositories/chit/brachRepository.js';
import ProjectAccessRepository from '../../../../infrastructure/repositories/chit/super/projectAccessRepository.js';
import AppSettingRepository from '../../../../infrastructure/repositories/chit/AppSettingRepository.js';
import GatwaySettingRepository from '../../../../infrastructure/repositories/chit/super/gateWayRepository.js';
import LayoutRepository from '../../../../infrastructure/repositories/chit/super/layoutSettingRepository.js';
import NotificationSettingRepository from '../../../../infrastructure/repositories/chit/super/notificationRepository.js';
import S3BucketRepository from '../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js';
import SmsSettingRepository from '../../../../infrastructure/repositories/chit/super/smsSettingRepository.js';
import WhatsAppRepository from '../../../../infrastructure/repositories/chit/super/whatsappRepository.js';
import GeneralSettingRepository from '../../../../infrastructure/repositories/chit/super/generalSettingRepository.js';
import ProjectRepository from '../../../../infrastructure/repositories/chit/ProjectRepository.js';
import ConfigurationUseCase from '../../../../usecases/auth/chit/admin/configurationUseCase.js';

import ConfigurationController from '../../../controllers/chit/admin/super/configurationController.js';

const router = express.Router();


const branchRepository = new BranchRepository();
const projectAccessRepository = new ProjectAccessRepository();
const appSettingRepository = new AppSettingRepository();
const gatewaySettingRepository = new GatwaySettingRepository();
const layoutRepository = new LayoutRepository();
const notificationSettingRepository = new NotificationSettingRepository();
const s3BucketRepository = new S3BucketRepository();
const smsSettingRepository = new SmsSettingRepository();
const whatsappRepository = new WhatsAppRepository();
const generalSettingRepository = new GeneralSettingRepository();
const projectRepository = new ProjectRepository()

const configurationUseCase = new ConfigurationUseCase(
    branchRepository,
    projectAccessRepository,
    appSettingRepository,
    gatewaySettingRepository,
    layoutRepository,
    notificationSettingRepository,
    s3BucketRepository,
    smsSettingRepository,
    whatsappRepository,
    generalSettingRepository,
    projectRepository
)


const configurationController = new ConfigurationController(
    configurationUseCase
);


router.post('/table', (req, res) => configurationController.configurationTable(req, res));

export default router;