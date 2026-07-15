/**
 * upload.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * endpoint های آپلود فایل — همه protected (نیاز به JWT ادمین)
 * مسیر فایل: src/routes/upload.routes.js
 *
 * POST   /api/upload/books/:id/image
 * POST   /api/upload/authors/:id/avatar
 * POST   /api/upload/submissions/:id/file
 * DELETE /api/upload/books/:id/image
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { uploadImages } from "../middlewares/upload.js";
import { uploadBookImage } from "../controllers/upload.controller.js";
import {deleteBookGalleryImage} from "../controllers/upload.controller.js";
import { requireAuth }   from "../middlewares/authMiddleware.js";
import {
  uploadImage,
  uploadDocument,
  handleUpload,
} from "../middlewares/upload.js";
import {
  uploadBookImage,
  uploadAuthorAvatar,
  uploadSubmissionFile,
  deleteBookImage,
} from "../controllers/upload.controller.js";

const router = Router();

// ✅ FIX: rate limiter برای آپلود فایل عمومی — جلوگیری از سوءاستفاده
// چون این endpoint برای کاربر ناشناس (بدون لاگین) باز است
const submissionUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ۱ ساعت
  max: 5,
  message: {
    success: false,
    message: "تعداد آپلود فایل زیاد است. لطفاً بعداً امتحان کنید",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── فایل اثر ارسالی — عمومی (بدون نیاز به لاگین) ────────────────────────────
// ✅ FIX: قبلاً این route هم زیر requireAuth بود، اما فرم "ارسال اثر"
// توسط کاربر ناشناس (نویسنده) پر می‌شود، نه ادمین — پس نباید نیاز به توکن داشته باشد
router.post(
  "/submissions/:id/file",
  submissionUploadLimiter,
  (req, _res, next) => { req.uploadFolder = "submissions"; next(); },
  handleUpload(uploadDocument),
  uploadSubmissionFile
);

// ✅ از اینجا به بعد فقط ادمین — تصویر کتاب و آواتار نویسنده
router.use(requireAuth);

// ─── تصویر جلد کتاب ──────────────────────────────────────────────────────────
router.post(
  "/books/:id/image",
  (req, _res, next) => { req.uploadFolder = "books"; next(); }, // تعیین پوشه
  handleUpload(uploadImage),
  uploadBookImage
);

router.delete("/books/:id/image", deleteBookImage);

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

export default router;
