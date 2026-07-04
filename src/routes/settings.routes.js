/**
 * settings.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * مسیر فایل: src/routes/settings.routes.js
 *
 * Public:
 *   GET /api/settings          ← همه تنظیمات (برای بارگذاری سایت)
 *   GET /api/settings/:key     ← یک بخش خاص
 *
 * Protected:
 *   PUT /api/settings          ← آپدیت چندین بخش با هم
 *   PUT /api/settings/:key     ← آپدیت یک بخش خاص
 */
import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  getAllSettings,
  getSetting,
  updateSetting,
  updateAllSettings,
} from "../controllers/settings.controller.js";

const router = Router();

// Public — فرانت این را برای بارگذاری تنظیمات سایت صدا می‌زند
router.get("/",     getAllSettings);
router.get("/:key", getSetting);

// Protected — فقط ادمین می‌تواند تنظیمات را تغییر دهد
router.put("/",     requireAuth, updateAllSettings);
router.put("/:key", requireAuth, updateSetting);

export default router;
