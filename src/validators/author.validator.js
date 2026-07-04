/**
 * author.validator.js
 * ─────────────────────────────────────────────────────────────────────────
 * اسکیمای اعتبارسنجی Zod برای endpoint های نویسندگان
 * مسیر فایل: src/validators/author.validator.js
 */
import { z } from "zod";

// ─── فیلدهای مشترک ───────────────────────────────────────────────────────────
const authorFields = {
  name: z
    .string({ required_error: "نام نویسنده الزامی است" })
    .min(2, "نام نویسنده باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام نویسنده نباید بیشتر از ۱۰۰ کاراکتر باشد")
    .trim(),

  email: z
    .string()
    .email("ایمیل معتبر نیست")
    .trim()
    .optional()
    .nullable(),

  phone: z
    .string()
    .max(20, "شماره تلفن نباید بیشتر از ۲۰ کاراکتر باشد")
    .trim()
    .optional()
    .nullable(),

  field: z
    .string()
    .max(50, "حوزه تخصصی نباید بیشتر از ۵۰ کاراکتر باشد")
    .trim()
    .optional()
    .nullable(),

  bio: z
    .string()
    .max(1000, "بیوگرافی نباید بیشتر از ۱۰۰۰ کاراکتر باشد")
    .trim()
    .optional()
    .nullable(),

  avatar: z
    .string()
    .url("آدرس تصویر معتبر نیست")
    .optional()
    .nullable(),

  status: z
    .enum(["ACTIVE", "INACTIVE"], {
      errorMap: () => ({ message: "وضعیت باید ACTIVE یا INACTIVE باشد" }),
    })
    .default("ACTIVE"),
};

// ─── ساخت نویسنده جدید ───────────────────────────────────────────────────────
export const createAuthorSchema = z.object({ ...authorFields });

// ─── ویرایش نویسنده (همه فیلدها اختیاری) ────────────────────────────────────
export const updateAuthorSchema = z.object({
  name:   authorFields.name.optional(),
  email:  authorFields.email,
  phone:  authorFields.phone,
  field:  authorFields.field,
  bio:    authorFields.bio,
  avatar: authorFields.avatar,
  status: authorFields.status.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "حداقل یک فیلد برای ویرایش باید ارسال شود" }
);

// ─── تغییر وضعیت (فعال/غیرفعال) ─────────────────────────────────────────────
export const toggleStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "وضعیت باید ACTIVE یا INACTIVE باشد" }),
  }),
});

// ─── پارامترهای query برای لیست نویسندگان ────────────────────────────────────
export const getAuthorsQuerySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "all"]).default("all"),
  field:  z.string().trim().optional(),
});
