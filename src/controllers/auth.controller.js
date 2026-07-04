/**
 * auth.controller.js
 * ─────────────────────────────────────────────────────────────────────────
 * کنترلر احراز هویت — login, logout, me, changePassword, changeUsername
 * مسیر فایل: src/controllers/auth.controller.js
 */
import { prisma }           from "../config/database.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateToken, setTokenCookie, clearTokenCookie } from "../utils/jwt.js";
import { AppError }         from "../middlewares/errorHandler.js";

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
/**
 * ورود ادمین با username و password
 * در صورت موفقیت، JWT در httpOnly cookie ذخیره می‌شود
 */
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // پیدا کردن ادمین
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      // ✅ پیام عمدی مبهم — مهاجم نمی‌داند username اشتباه بود یا password
      throw new AppError("نام کاربری یا رمز عبور اشتباه است", 401);
    }

    // بررسی پسورد
    const isValid = await comparePassword(password, admin.passwordHash);
    if (!isValid) {
      throw new AppError("نام کاربری یا رمز عبور اشتباه است", 401);
    }

    // تولید توکن و ذخیره در cookie
    const token = generateToken(admin);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: "خوش آمدید",
      admin: {
        id:       admin.id,
        username: admin.username,
      },
    });

  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
/**
 * خروج — پاک کردن cookie
 */
export async function logout(req, res) {
  clearTokenCookie(res);
  res.json({ success: true, message: "با موفقیت خارج شدید" });
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
/**
 * اطلاعات ادمین لاگین‌کرده (از req.admin که authMiddleware پر کرده)
 */
export async function me(req, res) {
  res.json({
    success: true,
    admin: {
      id:       req.admin.id,
      username: req.admin.username,
    },
  });
}

// ─── PUT /api/auth/password ───────────────────────────────────────────────────
/**
 * تغییر رمز عبور — نیاز به رمز فعلی دارد
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    // خواندن پسورد فعلی از دیتابیس
    const admin = await prisma.admin.findUnique({
      where:  { id: req.admin.id },
      select: { passwordHash: true },
    });

    // بررسی رمز فعلی
    const isValid = await comparePassword(currentPassword, admin.passwordHash);
    if (!isValid) {
      throw new AppError("رمز عبور فعلی اشتباه است", 400);
    }

    // هش و ذخیره رمز جدید
    const newHash = await hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: req.admin.id },
      data:  { passwordHash: newHash },
    });

    // ✅ بعد از تغییر پسورد، کوکی را پاک کن تا دوباره لاگین کند
    clearTokenCookie(res);

    res.json({
      success: true,
      message: "رمز عبور تغییر یافت — لطفاً دوباره وارد شوید",
    });

  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/auth/username ───────────────────────────────────────────────────
/**
 * تغییر نام کاربری
 */
export async function changeUsername(req, res, next) {
  try {
    const { username } = req.body;

    // چک تکراری نبودن username
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing && existing.id !== req.admin.id) {
      throw new AppError("این نام کاربری قبلاً ثبت شده است", 409);
    }

    const updated = await prisma.admin.update({
      where:  { id: req.admin.id },
      data:   { username },
      select: { id: true, username: true },
    });

    // توکن جدید بساز چون username در payload تغییر کرده
    const newToken = generateToken(updated);
    setTokenCookie(res, newToken);

    res.json({
      success: true,
      message: "نام کاربری تغییر یافت",
      admin:   updated,
    });

  } catch (err) {
    next(err);
  }
}
