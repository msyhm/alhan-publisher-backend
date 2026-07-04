/**
 * password.js
 * ─────────────────────────────────────────────────────────────────────────
 * ابزار هش و مقایسه پسورد با bcrypt
 * مسیر فایل: src/utils/password.js
 */
import bcrypt from "bcrypt";

// ✅ cost factor 12 — تعادل خوب بین امنیت و سرعت
// (هر عدد بیشتر زمان هش را دو برابر می‌کند)
const SALT_ROUNDS = 12;

/**
 * هش کردن پسورد خام
 * @param {string} plainPassword — پسورد خام
 * @returns {Promise<string>} — پسورد هش‌شده برای ذخیره در دیتابیس
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * مقایسه پسورد خام با هش ذخیره‌شده
 * @param {string} plainPassword — پسوردی که کاربر وارد کرده
 * @param {string} hashedPassword — هش ذخیره‌شده در دیتابیس
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
