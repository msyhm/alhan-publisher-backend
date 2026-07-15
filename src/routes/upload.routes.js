/**
 * upload.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * endpoint های آپلود فایل — همه protected (نیاز به JWT ادمین)
 * مسیر فایل: src/routes/upload.routes.js
 *
 * POST   /api/upload/books/:id/image
 * POST   /api/upload/books/:id/images
 * POST   /api/upload/authors/:id/avatar
 * POST   /api/upload/submissions/:id/file
 * DELETE /api/upload/books/:id/image
 * DELETE /api/upload/books/:id/images
 */
import { Router } from "express";
import { requireAuth }   from "../middlewares/authMiddleware.js";
import {
  uploadImage,
  uploadImages,
  uploadDocument,
  handleUpload,
} from "../middlewares/upload.js";
import {
  uploadBookImage,
  uploadBookImages,
  deleteBookGalleryImage,
  uploadAuthorAvatar,
  uploadSubmissionFile,
  deleteBookImage,
} from "../controllers/upload.controller.js";

const router = Router();

// ✅ همه route های آپلود نیاز به احراز هویت دارند
router.use(requireAuth);

// ─── تصویر جلد کتاب (اصلی) ────────────────────────────────────────────────────
router.post(
  "/books/:id/image",
  (req, _res, next) => { req.uploadFolder = "books"; next(); }, // تعیین پوشه
  handleUpload(uploadImage),
  uploadBookImage
);

router.delete("/books/:id/image", deleteBookImage);

// ─── گالری تصاویر بیشتر کتاب ──────────────────────────────────────────────────
router.post(
  "/books/:id/images",
  (req, _res, next) => { req.uploadFolder = "books"; next(); },
  handleUpload(uploadImages),
  uploadBookImages
);

router.delete("/books/:id/images", deleteBookGalleryImage);

// ─── آواتار نویسنده ───────────────────────────────────────────────────────────
router.post(
  "/authors/:id/avatar",
  (req, _res, next) => { req.uploadFolder = "authors"; next(); },
  handleUpload(uploadImage),
  uploadAuthorAvatar
);

// ─── فایل اثر ارسالی ──────────────────────────────────────────────────────────
router.post(
  "/submissions/:id/file",
  (req, _res, next) => { req.uploadFolder = "submissions"; next(); },
  handleUpload(uploadDocument),
  uploadSubmissionFile
);

export default router;