/**
 * authMiddleware.js
 * ─────────────────────────────────────────────────────────────────────────
 * بررسی JWT قبل از دسترسی به route های محافظت‌شده ادمین
 * مسیر فایل: src/middlewares/authMiddleware.js
 */
import { extractToken, verifyToken } from "../utils/jwt.js";
import { prisma } from "../config/database.js";
import { AppError } from "./errorHandler.js";

/**
 * ✅ middleware احراز هویت — روی تمام route های /api/admin/* استفاده می‌شود
 *
 * ترتیب بررسی:
 *  ۱. توکن از cookie یا Authorization header استخراج می‌شود
 *  ۲. توکن verify می‌شود (امضا + انقضا)
 *  ۳. ادمین در دیتابیس پیدا می‌شود (از حذف بعد از لاگین جلوگیری می‌کند)
 *  ۴. اطلاعات ادمین به req.admin اضافه می‌شود
 */
export async function requireAuth(req, res, next) {
  try {
    // ۱. استخراج توکن
    const token = extractToken(req);
    if (!token) {
      throw new AppError("برای دسترسی به این بخش باید وارد شوید", 401);
    }

    // ۲. verify توکن
    const payload = verifyToken(token);
    if (!payload) {
      throw new AppError("توکن نامعتبر یا منقضی شده است — دوباره وارد شوید", 401);
    }

    // ✅ بررسی نقش توکن: باید متعلق به ادمین باشد، نه یک کاربر عادی
    if (payload.role !== "admin") {
      throw new AppError("دسترسی غیرمجاز", 403);
    }

    // ۳. پیدا کردن ادمین در دیتابیس
    // (اگر ادمین بعد از لاگین حذف شده باشد، توکن قدیمی کار نمی‌کند)
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true }, // passwordHash برگشت داده نمی‌شود
    });

    if (!admin) {
      throw new AppError("حساب کاربری پیدا نشد", 401);
    }

    // ۴. اضافه کردن اطلاعات ادمین به req برای استفاده در controller
    req.admin = admin;
    next();

  } catch (err) {
    next(err);
  }
}

export async function requireUserAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw new AppError("برای این کار ابتدا وارد حساب کاربری خود شوید", 401);

    const payload = verifyToken(token);
    if (!payload || payload.role !== "user") {
      throw new AppError("توکن نامعتبر یا منقضی شده است — دوباره وارد شوید", 401);
    }

    const user = await prisma.user.findUnique({
      where:  { id: payload.sub },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!user) throw new AppError("حساب کاربری پیدا نشد", 401);

    req.currentUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * middleware اعتبارسنجی Zod — جلوگیری از ورود داده نامعتبر
 *
 * استفاده:
 *   router.post("/login", validate(loginSchema), authController.login);
 *
 * @param {import("zod").ZodSchema} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // تبدیل خطاهای Zod به پیام فارسی ساده
      const firstError = result.error.errors[0]?.message || "داده نامعتبر است";
      return next(new AppError(firstError, 400));
    }
    // داده پاک‌شده (trimmed و typed) را جایگزین req.body می‌کنیم
    req.body = result.data;
    next();
  };
}
