/**
 * auth.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * تعریف endpoint های احراز هویت
 * مسیر فایل: src/routes/auth.routes.js
 *
 * Public:
 *   POST /api/auth/login
 *
 * Protected (نیاز به JWT):
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 *   PUT  /api/auth/password
 *   PUT  /api/auth/username
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";

import { requireAuth, validate } from "../middlewares/authMiddleware.js";
import {
  loginSchema,
  changePasswordSchema,
  changeUsernameSchema,
} from "../validators/auth.validator.js";
import {
  login,
  logout,
  me,
  changePassword,
  changeUsername,
} from "../controllers/auth.controller.js";

const router = Router();

// ✅ rate limiter اختصاصی برای لاگین
// جلوگیری از brute-force: حداکثر ۵ تلاش در ۱۵ دقیقه
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // ۱۵ دقیقه
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || 5,
  message: {
    success: false,
    message: "تعداد تلاش‌های ناموفق زیاد است. لطفاً ۱۵ دقیقه دیگر امتحان کنید",
  },
  standardHeaders: true,
  legacyHeaders:   false,
  // ✅ فقط برای درخواست‌های ناموفق (401) شمارنده را افزایش می‌دهد
  skipSuccessfulRequests: true,
});

// ─── Public route ──────────────────────────────────────────────────────────────
router.post(
  "/login",
  loginLimiter,           // rate limiting
  validate(loginSchema),  // اعتبارسنجی req.body
  login                   // controller
);

// ─── Protected routes ──────────────────────────────────────────────────────────
router.post("/logout",   requireAuth, logout);
router.get( "/me",       requireAuth, me);
router.put( "/password", requireAuth, validate(changePasswordSchema), changePassword);
router.put( "/username", requireAuth, validate(changeUsernameSchema), changeUsername);

export default router;
