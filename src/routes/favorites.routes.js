import { Router } from "express";
import { requireUserAuth } from "../middlewares/authMiddleware.js";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favorites.controller.js";

const router = Router();
router.use(requireUserAuth);

router.get(   "/",        getFavorites);
router.post(  "/:bookId", addFavorite);
router.delete("/:bookId", removeFavorite);

export default router;