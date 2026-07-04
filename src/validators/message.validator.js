/**
 * message.validator.js
 * ─────────────────────────────────────────────────────────────────────────
 * اسکیمای اعتبارسنجی Zod برای endpoint های پیام‌ها
 * مسیر فایل: src/validators/message.validator.js
 */
import { z } from "zod";

// ─── ارسال پیام جدید (از فرم تماس عمومی) ────────────────────────────────────
export const createMessageSchema = z.object({
  name: z
    .string({ required_error: "نام الزامی است" })
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام نباید بیشتر از ۱۰۰ کاراکتر باشد")
    .trim(),

  email: z
    .string({ required_error: "ایمیل الزامی است" })
    .email("ایمیل معتبر نیست")
    .trim(),

  phone: z
    .string()
    .max(20)
    .trim()
    .optional(),

  subject: z
    .string()
    .max(200, "موضوع نباید بیشتر از ۲۰۰ کاراکتر باشد")
    .trim()
    .optional(),

  message: z
    .string({ required_error: "متن پیام الزامی است" })
    .min(10, "پیام باید حداقل ۱۰ کاراکتر باشد")
    .max(2000, "پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد")
    .trim(),
});

// ─── پارامترهای query برای لیست پیام‌ها (ادمین) ──────────────────────────────
export const getMessagesQuerySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  isRead: z.enum(["true", "false", "all"]).default("all"),
});
