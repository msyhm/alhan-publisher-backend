/**
 * books.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * تعریف endpoint های کتاب‌ها
 * مسیر فایل: src/routes/books.routes.js
 *
 * Public (بدون نیاز به لاگین):
 *   GET  /api/books
 *   GET  /api/books/categories
 *   GET  /api/books/:id
 *
 * Protected (نیاز به JWT ادمین):
 *   POST   /api/books
 *   PUT    /api/books/:id
 *   DELETE /api/books/:id
 */
import { Router } from "express";
import { requireAuth, validate } from "../middlewares/authMiddleware.js";
import { createBookSchema, updateBookSchema } from "../validators/book.validator.js";
import {
  getBooks,
  getCategories,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books.controller.js";

const router = Router();

// ─── Public routes ─────────────────────────────────────────────────────────────
// ✅ /categories باید قبل از /:id باشد — وگرنه "categories" به عنوان id تفسیر می‌شود
router.get("/categories", getCategories);
router.get("/",           getBooks);
router.get("/:id",        getBook);

// ─── Protected routes (فقط ادمین) ─────────────────────────────────────────────
router.post(  "/",    requireAuth, validate(createBookSchema), createBook);
router.put(   "/:id", requireAuth, validate(updateBookSchema), updateBook);
router.delete("/:id", requireAuth,                             deleteBook);

export default router;
