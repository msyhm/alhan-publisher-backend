/**
 * jwt.js
 * ─────────────────────────────────────────────────────────────────────────
 * تولید، بررسی و مدیریت JWT توکن
 * مسیر فایل: src/utils/jwt.js
 */
import jwt from "jsonwebtoken";

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ─── تولید توکن ──────────────────────────────────────────────────────────────
/**
 * ساخت JWT برای ادمین پس از لاگین موفق
 * @param {{ id: number, username: string }} admin
 * @returns {string} — توکن JWT
 */
export function generateToken(admin) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET تعریف نشده است");

  return jwt.sign(
    {
      sub:      admin.id,
      username: admin.username,
      role:     "admin",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ─── بررسی توکن ──────────────────────────────────────────────────────────────
/**
 * بررسی و decode کردن JWT
 * @param {string} token
 * @returns {{ sub: number, username: string, role: string } | null}
 */
export function verifyToken(token) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET تعریف نشده است");

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    // توکن نامعتبر، منقضی یا دستکاری‌شده
    return null;
  }
}

// ─── تنظیم توکن در httpOnly cookie ───────────────────────────────────────────
/**
 * ✅ امن‌ترین روش ذخیره JWT — httpOnly cookie
 * JavaScript فرانت نمی‌تواند این کوکی را بخواند (جلوگیری از XSS)
 * @param {import("express").Response} res
 * @param {string} token
 */
export function setTokenCookie(res, token) {
  const maxAge = parseDurationToMs(JWT_EXPIRES_IN);
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isProd,
    // ✅ فرانت (Netlify) و بک‌اند (Railway) دو دامنه متفاوت‌اند → cross-site
    // "lax" باعث می‌شود مرورگر کوکی را روی fetch() های cross-site اصلا ارسال نکند
    // (نکته: sameSite:"none" فقط وقتی کار می‌کند که secure:true هم باشد — بالا تضمین شده)
    sameSite: isProd ? "none" : "lax",
    maxAge,
    // ✅ حذف شد: domain: ".railway.app" فقط برای زیردامنه‌های railway.app کار می‌کرد
    // ولی فرانت روی Netlify است، نه railway.app — این تنظیم هیچ کمکی نمی‌کرد
  });
}

/**
 * پاک کردن کوکی هنگام logout
 * @param {import("express").Response} res
 */
export function clearTokenCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure:   isProd,
    // ✅ باید دقیقاً با تنظیمات setTokenCookie یکی باشد وگرنه مرورگر کوکی را پاک نمی‌کند
    sameSite: isProd ? "none" : "lax",
  });
}

// ─── خواندن توکن از درخواست ──────────────────────────────────────────────────
/**
 * استخراج توکن از cookie یا Authorization header
 * ترتیب: اول cookie، بعد header (برای انعطاف در تست با Postman)
 * @param {import("express").Request} req
 * @returns {string | null}
 */
export function extractToken(req) {
  // اول از httpOnly cookie
  if (req.cookies?.auth_token) {
    return req.cookies.auth_token;
  }

  // بعد از Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

// ─── helper: تبدیل مدت زمان به میلی‌ثانیه ───────────────────────────────────
function parseDurationToMs(duration) {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = String(duration).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86_400_000; // پیش‌فرض: ۷ روز
  return parseInt(match[1]) * (units[match[2]] || 86_400_000);
}
