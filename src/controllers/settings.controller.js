/**
 * settings.controller.js
 * ─────────────────────────────────────────────────────────────────────────
 * مسیر فایل: src/controllers/settings.controller.js
 */
import * as settingsService from "../services/settings.service.js";
import { AppError } from "../middlewares/errorHandler.js";

const VALID_KEYS = ["general", "hero", "contact", "social", "about", "universities"];

// ─── GET /api/settings (عمومی) ────────────────────────────────────────────────
// فرانت از این endpoint برای بارگذاری همه تنظیمات سایت استفاده می‌کند
export async function getAllSettings(req, res, next) {
  try {
    const settings = await settingsService.getAllSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/settings/:key (عمومی) ──────────────────────────────────────────
export async function getSetting(req, res, next) {
  try {
    const { key } = req.params;
    if (!VALID_KEYS.includes(key)) {
      throw new AppError("کلید تنظیمات معتبر نیست", 400);
    }

    const value = await settingsService.getSettingByKey(key);
    if (value === null) throw new AppError("تنظیمات پیدا نشد", 404);

    res.json({ success: true, key, value });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/settings/:key (ادمین) ──────────────────────────────────────────
export async function updateSetting(req, res, next) {
  try {
    const { key } = req.params;
    if (!VALID_KEYS.includes(key)) {
      throw new AppError("کلید تنظیمات معتبر نیست", 400);
    }

    const value = await settingsService.updateSetting(key, req.body);
    res.json({
      success: true,
      message: `تنظیمات "${key}" ذخیره شد`,
      key,
      value,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/settings (ادمین) — آپدیت چندین بخش با هم ──────────────────────
export async function updateAllSettings(req, res, next) {
  try {
    const settings = await settingsService.updateManySettings(req.body);
    res.json({
      success: true,
      message: "تنظیمات سایت ذخیره شد",
      settings,
    });
  } catch (err) {
    next(err);
  }
}
