import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireUserAuth, validate } from "../middlewares/authMiddleware.js";
import { createBookSchema, updateBookSchema } from "../validators/book.validator.js";
import { createReviewSchema } from "../validators/review.validator.js";
import { getBooks, getCategories, getBook, createBook, updateBook, deleteBook } from "../controllers/books.controller.js";
import { getBookReviews, createBookReview } from "../controllers/reviews.controller.js";

const router = Router();

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: "تعداد نظرات ارسالی زیاد است. لطفاً بعداً امتحان کنید" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/categories", getCategories);
router.get("/",           getBooks);
router.get("/:id",        getBook);

router.get( "/:bookId/reviews", getBookReviews);
router.post("/:bookId/reviews", reviewLimiter, requireUserAuth, validate(createReviewSchema), createBookReview);

router.post(  "/",    requireAuth, validate(createBookSchema), createBook);
router.put(   "/:id", requireAuth, validate(updateBookSchema), updateBook);
router.delete("/:id", requireAuth,                             deleteBook);

export default router;