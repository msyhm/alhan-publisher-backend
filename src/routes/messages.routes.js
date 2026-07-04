/**
 * messages.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * مسیر فایل: src/routes/messages.routes.js
 *
 * Public:
 *   POST /api/messages          ← فرم تماس عمومی
 *
 * Protected:
 *   GET    /api/messages
 *   GET    /api/messages/:id
 *   PATCH  /api/messages/read-all
 *   DELETE /api/messages/:id
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, validate } from "../middlewares/authMiddleware.js";
import { createMessageSchema } from "../validators/message.validator.js";
import {
  getMessages, getMessage, createMessage,
  markAllAsRead, deleteMessage,
} from "../controllers/messages.controller.js";

const router = Router();

// ✅ rate limiter برای فرم تماس — جلوگیری از spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // ۱ ساعت
  max:      5,                // حداکثر ۵ پیام در ساعت از یک IP
  message: {
    success: false,
    message: "تعداد پیام‌های ارسالی زیاد است. لطفاً بعداً امتحان کنید",
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Public — ترتیب مهم است: read-all قبل از /:id
router.post("/", contactLimiter, validate(createMessageSchema), createMessage);

// Protected
router.get(   "/",         requireAuth, getMessages);
router.patch( "/read-all", requireAuth, markAllAsRead);
router.get(   "/:id",      requireAuth, getMessage);
router.delete("/:id",      requireAuth, deleteMessage);

export default router;
