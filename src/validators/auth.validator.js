/**
 * auth.validator.js
 * ─────────────────────────────────────────────────────────────────────────
 * اسکیمای اعتبارسنجی Zod برای endpoint های احراز هویت
 * مسیر فایل: src/validators/auth.validator.js
 */
import { z } from "zod";

// ─── لاگین ───────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z
    .string({ required_error: "نام کاربری الزامی است" })
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
    .max(50, "نام کاربری نباید بیشتر از ۵۰ کاراکتر باشد")
    .trim(),

  password: z
    .string({ required_error: "رمز عبور الزامی است" })
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .max(100, "رمز عبور نباید بیشتر از ۱۰۰ کاراکتر باشد"),
});

// ─── تغییر پسورد ─────────────────────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "رمز عبور فعلی الزامی است" })
      .min(1, "رمز عبور فعلی الزامی است"),

    newPassword: z
      .string({ required_error: "رمز عبور جدید الزامی است" })
      .min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد")
      .max(100)
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        "رمز عبور جدید باید شامل حداقل یک حرف و یک عدد باشد"
      ),

    confirmPassword: z
      .string({ required_error: "تکرار رمز عبور الزامی است" })
      .min(1, "تکرار رمز عبور الزامی است"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "رمز عبور جدید و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "رمز عبور جدید نباید با رمز فعلی یکسان باشد",
    path: ["newPassword"],
  });

// ─── تغییر نام کاربری ────────────────────────────────────────────────────────
export const changeUsernameSchema = z.object({
  username: z
    .string({ required_error: "نام کاربری جدید الزامی است" })
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
    .max(50, "نام کاربری نباید بیشتر از ۵۰ کاراکتر باشد")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و _ باشد"
    )
    .trim(),
});
