/**
 * submissions.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * مسیر فایل: src/routes/submissions.routes.js
 *
 * Public:
 *   POST /api/submissions               ← ارسال اثر
 *   GET  /api/submissions/track/:code   ← پیگیری با کد
 *
 * Protected:
 *   GET    /api/submissions
 *   GET    /api/submissions/:id
 *   PATCH  /api/submissions/:id/status
 *   DELETE /api/submissions/:id
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, validate } from "../middlewares/authMiddleware.js";
import { createSubmissionSchema } from "../validators/submission.validator.js";
import {
  getSubmissions, getSubmission, trackSubmission,
  createSubmission, updateStatus, deleteSubmission,
} from "../controllers/submissions.controller.js";

const router = Router();

// ✅ rate limiter برای ارسال اثر — حداکثر ۳ اثر در ساعت از یک IP
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      3,
  message: {
    success: false,
    message: "تعداد ارسال‌ها زیاد است. لطفاً بعداً امتحان کنید",
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Public — track باید قبل از /:id باشد
router.get( "/track/:code", trackSubmission);
router.post("/", submitLimiter, validate(createSubmissionSchema), createSubmission);

// Protected
router.get(   "/",           requireAuth, getSubmissions);
router.get(   "/:id",        requireAuth, getSubmission);
router.patch( "/:id/status", requireAuth, updateStatus);
router.delete("/:id",        requireAuth, deleteSubmission);

export default router;
