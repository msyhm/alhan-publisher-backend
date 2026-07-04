/**
 * submission.validator.js
 * ─────────────────────────────────────────────────────────────────────────
 * اسکیمای اعتبارسنجی Zod برای endpoint های آثار ارسالی
 * مسیر فایل: src/validators/submission.validator.js
 */
import { z } from "zod";

// ─── ارسال اثر جدید (از فرم عمومی) ──────────────────────────────────────────
export const createSubmissionSchema = z.object({
  fullName: z
    .string({ required_error: "نام و نام خانوادگی الزامی است" })
    .min(3, "نام باید حداقل ۳ کاراکتر باشد")
    .max(100)
    .trim(),

  email: z
    .string({ required_error: "ایمیل الزامی است" })
    .email("ایمیل معتبر نیست")
    .trim(),

  phone: z
    .string({ required_error: "شماره تماس الزامی است" })
    .min(10, "شماره تماس معتبر نیست")
    .max(20)
    .trim(),

  title: z
    .string({ required_error: "عنوان اثر الزامی است" })
    .min(2, "عنوان اثر باید حداقل ۲ کاراکتر باشد")
    .max(200)
    .trim(),

  category: z
    .string({ required_error: "دسته‌بندی الزامی است" })
    .min(1, "دسته‌بندی الزامی است"),

  summary: z
    .string({ required_error: "خلاصه اثر الزامی است" })
    .min(20, "خلاصه اثر باید حداقل ۲۰ کاراکتر باشد")
    .max(2000)
    .trim(),

  description: z
    .string()
    .max(5000)
    .trim()
    .optional(),

  hasPublished: z
    .boolean()
    .default(false),

  // اطلاعات فایل — اختیاری (آپلود در endpoint جداگانه)
  hasFile:  z.boolean().default(false),
  fileName: z.string().max(255).optional().nullable(),
  fileSize: z.number().int().positive().optional().nullable(),
});

// ─── آپدیت وضعیت اثر (فقط ادمین) ────────────────────────────────────────────
export const updateStatusSchema = z.object({
  status: z.enum(
    ["PENDING", "REVIEWING", "APPROVED", "REJECTED"],
    {
      errorMap: () => ({ message: "وضعیت معتبر نیست" }),
    }
  ),
  note: z
    .string()
    .max(500, "یادداشت نباید بیشتر از ۵۰۰ کاراکتر باشد")
    .trim()
    .optional(),
});

// ─── پارامترهای query برای لیست آثار (ادمین) ─────────────────────────────────
export const getSubmissionsQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(10),
  search:   z.string().trim().optional(),
  status:   z.enum(["PENDING","REVIEWING","APPROVED","REJECTED","all"]).default("all"),
  category: z.string().trim().optional(),
});
