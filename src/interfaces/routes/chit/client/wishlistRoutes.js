import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import WishlistController from "../../../controllers/chit/admin/client/wishlistController.js";
import WishlistUsecase from "../../../../usecases/auth/chit/client/wishlistUseCase.js";
import WishlistRepository from "../../../../infrastructure/repositories/chit/wishlistRepository.js";


const router = express.Router()
const tokenService = new TokenService()
const authMiddleware= new AuthMiddleware(tokenService)
const wishlistRepo = new WishlistRepository()
const wishlistUsecase = new WishlistUsecase(wishlistRepo)
const wishlistController = new WishlistController(wishlistUsecase)


router.use(authMiddleware.protect)
router.post('/',(req,res)=>wishlistController.toggleWishlistItem(req,res))
router.get('/',(req,res)=>wishlistController.getWishlist(req,res))

export default router;