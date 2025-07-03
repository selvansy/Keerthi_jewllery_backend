import express from "express";
import topupController from "../../../controllers/chit/admin/client/topupController.js";
import topupRepository from "../../../../infrastructure/repositories/chit/topupRepository.js";
import topupUsecase from "../../../../usecases/auth/chit/client/topupUsecase.js";
import TokenService from "../../../../utils/jwtToken.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";

const router = express.Router();

const topupConfigRepo = new topupRepository();
const topupusecase = new topupUsecase(topupConfigRepo);
const topupConfigController = new topupController(topupusecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

router.use(authMiddleware.protect); 


router.patch("/:id", (req, res) => topupConfigController.UpdateTopup(req, res));
router.post("/add", (req, res) => topupConfigController.addTopupHistory(req, res));
router.post("/table", (req, res) => topupConfigController.getAllTopup(req, res));
router.post("/pending", (req, res) => topupConfigController.getTopupByStatus(req, res));
router.get("/:id", (req, res) => topupConfigController.getTopupByClientId(req, res));
router.delete("/:id", (req, res) => topupConfigController.deleteConfig(req, res));

export default router;
