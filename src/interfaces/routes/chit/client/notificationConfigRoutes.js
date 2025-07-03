import express from "express";
import NotificationConfigController from "../../../controllers/chit/admin/client/notificationConfigController.js";
import NotificationConfigRepository from "../../../../infrastructure/repositories/chit/notificationConfigRepository.js";
import NotificationConfigUsecase from "../../../../usecases/auth/chit/client/notificationConfigUseCase.js";
import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";

const router = express.Router();

const notificationConfigRepo = new NotificationConfigRepository();
const notificationConfigUsecase = new NotificationConfigUsecase(notificationConfigRepo);
const notificationConfigController = new NotificationConfigController(notificationConfigUsecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

router.use(authMiddleware.protect);

router.post("/", (req, res) => notificationConfigController.saveOrUpdateConfig(req, res));
router.get("/", (req, res) => notificationConfigController.getConfigByUser(req, res));
router.get("/all", (req, res) => notificationConfigController.getAllConfigs(req, res));
router.delete("/:id", (req, res) => notificationConfigController.deleteConfig(req, res));

export default router;
