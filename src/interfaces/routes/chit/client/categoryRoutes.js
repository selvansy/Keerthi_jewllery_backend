import express from "express";

import CategoryRepository from "../../../../infrastructure/repositories/chit/categoryRepository.js";
import CategoryUseCase from "../../../../usecases/auth/chit/client/CategoryUsecase.js";
import CategoryController from "../../../controllers/chit/admin/client/categoryController.js";
import CategoryValidator from "../../../../utils/validations/categoryValidation.js";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import BranchRepository from "../../../../infrastructure/repositories/chit/brachRepository.js";


const branchRepository = new BranchRepository()
const repository = new CategoryRepository();
const useCase = new CategoryUseCase(repository,branchRepository);
const validator = new CategoryValidator();
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

const controller = new CategoryController(useCase, validator);

const router = express.Router();

router.use(authMiddleware.protect);
router.get('/all',(req,res)=>controller.getAllCategories(req,res))
router.get('/',(req,res)=>controller.getAllActiveCategory(req,res))
router.post('/table',(req,res)=>controller.getCategory(req,res))
router.get("/:id", (req, res) => controller.getById(req, res));
router.get("/branch/:id", (req, res) => controller.getByBranchId(req, res));
router.get("/metal/:id", (req, res) => controller.getByMetalId(req, res));
router.post("/", (req, res) => controller.addCategory(req, res));
router.patch("/:id", (req, res) => controller.editCategory(req, res));
router.patch("/:id/active", (req, res) => controller.changeStatus(req, res));
router.delete("/:id", (req, res) => controller.deleteCategory(req, res));


export default router;
