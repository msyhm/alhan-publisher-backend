import { Router } from "express";
import { requireAuth, validate } from "../middlewares/authMiddleware.js";
import { updateReviewStatusSchema } from "../validators/review.validator.js";
import { getReviews, updateStatus, remove } from "../controllers/reviews.controller.js";

const router = Router();
router.use(requireAuth);
router.get(   "/",            getReviews);
router.patch( "/:id/status",  validate(updateReviewStatusSchema), updateStatus);
router.delete("/:id",         remove);

export default router;