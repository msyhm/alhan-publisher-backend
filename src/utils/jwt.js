/**
 * jwt.js
 * ─────────────────────────────────────────────────────────────────────────
 * تولید، بررسی و مدیریت JWT توکن
 * مسیر فایل: src/utils/jwt.js
 */
import jwt from "jsonwebtoken";

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

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

export function generateUserToken(user) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET تعریف نشده است");
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email, role: "user" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET تعریف نشده است");

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function setTokenCookie(res, token) {
  const maxAge = parseDurationToMs(JWT_EXPIRES_IN);
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isProd,
    // ✅ فرانت (Netlify) و بک‌اند (Railway) دو دامنه متفاوت‌اند → cross-site
    sameSite: isProd ? "none" : "lax",
    maxAge,
  });
}

export function clearTokenCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? "none" : "lax",
  });
}

export function extractToken(req) {
  if (req.cookies?.auth_token) {
    return req.cookies.auth_token;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

function parseDurationToMs(duration) {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = String(duration).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86_400_000;
  return parseInt(match[1]) * (units[match[2]] || 86_400_000);
}
