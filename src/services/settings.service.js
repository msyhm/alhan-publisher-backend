/**
 * settings.service.js
 * ─────────────────────────────────────────────────────────────────────────
 * منطق دیتابیس برای تنظیمات سایت
 * مسیر فایل: src/services/settings.service.js
 */
import { prisma } from "../config/database.js";

// کلیدهای معتبر تنظیمات
const VALID_KEYS = ["general", "hero", "contact", "social", "about", "universities", "shipping"];

// ─── دریافت همه تنظیمات ──────────────────────────────────────────────────────
export async function getAllSettings() {
  const rows = await prisma.siteSetting.findMany();

  // تبدیل آرایه به object: { general: {...}, hero: {...}, ... }
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

// ─── دریافت یک بخش از تنظیمات ────────────────────────────────────────────────
export async function getSettingByKey(key) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

// ─── آپدیت یک بخش از تنظیمات ─────────────────────────────────────────────────
export async function updateSetting(key, value) {
  // ✅ upsert: اگر وجود دارد آپدیت، اگر نه بساز
  const row = await prisma.siteSetting.upsert({
    where:  { key },
    update: { value },
    create: { key, value },
  });
  return row.value;
}

// ─── آپدیت چندین بخش با هم ───────────────────────────────────────────────────
export async function updateManySettings(updates) {
  // اجرای همه upsert ها به صورت موازی
  await Promise.all(
    Object.entries(updates)
      .filter(([key]) => VALID_KEYS.includes(key))
      .map(([key, value]) =>
        prisma.siteSetting.upsert({
          where:  { key },
          update: { value },
          create: { key, value },
        })
      )
  );
  return getAllSettings();
}

// ─── بازنشانی یک بخش به مقدار پیش‌فرض ───────────────────────────────────────
export async function resetSetting(key, defaultValue) {
  await prisma.siteSetting.upsert({
    where:  { key },
    update: { value: defaultValue },
    create: { key, value: defaultValue },
  });
  return defaultValue;
}
