/**
 * book.validator.js
 * ─────────────────────────────────────────────────────────────────────────
 * اسکیمای اعتبارسنجی Zod برای endpoint های کتاب
 * مسیر فایل: src/validators/book.validator.js
 */
import { z } from "zod";

// ─── فیلدهای مشترک ───────────────────────────────────────────────────────────
const bookFields = {
  title: z
    .string({ required_error: "عنوان کتاب الزامی است" })
    .min(2, "عنوان کتاب باید حداقل ۲ کاراکتر باشد")
    .max(200, "عنوان کتاب نباید بیشتر از ۲۰۰ کاراکتر باشد")
    .trim(),

  authorId: z
    .number({ invalid_type_error: "شناسه نویسنده باید عدد باشد" })
    .int()
    .positive()
    .optional()
    .nullable(),

  authorName: z
    .string()
    .max(100)
    .trim()
    .optional()
    .nullable(),

  description: z
    .string()
    .max(2000, "توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد")
    .trim()
    .optional()
    .nullable(),

  category: z
    .string()
    .max(50)
    .trim()
    .optional()
    .nullable(),

  pages: z
    .number({ invalid_type_error: "تعداد صفحات باید عدد باشد" })
    .int()
    .positive("تعداد صفحات باید بیشتر از صفر باشد")
    .optional()
    .nullable(),

  year: z
    .number({ invalid_type_error: "سال انتشار باید عدد باشد" })
    .int()
    .min(1300, "سال انتشار معتبر نیست")
    .max(1500, "سال انتشار معتبر نیست")
    .optional()
    .nullable(),

  isAudio: z
    .boolean()
    .default(false),

  image: z
    .string()
    .url("آدرس تصویر معتبر نیست")
    .optional()
    .nullable(),

  price: z
    .number({ invalid_type_error: "قیمت باید عدد باشد" })
    .nonnegative("قیمت نمی‌تواند منفی باشد")
    .optional()
    .nullable(),  // null = تماس برای خرید

  isbn: z
    .string()
    .regex(/^\d{10,13}$/, "شابک باید ۱۰ یا ۱۳ رقم عدد باشد")
    .optional()
    .nullable(),

  edition: z
    .string()
    .max(20)
    .trim()
    .optional()
    .nullable(),

  publisherCity: z
    .string()
    .max(50)
    .trim()
    .optional()
    .nullable(),
};

// ─── ساخت کتاب جدید ──────────────────────────────────────────────────────────
export const createBookSchema = z.object({
  ...bookFields,
  title: bookFields.title, // title الزامی در create
});

// ─── ویرایش کتاب (همه فیلدها اختیاری) ───────────────────────────────────────
export const updateBookSchema = z.object({
  title:         bookFields.title.optional(),
  authorId:      bookFields.authorId,
  authorName:    bookFields.authorName,
  description:   bookFields.description,
  category:      bookFields.category,
  pages:         bookFields.pages,
  year:          bookFields.year,
  isAudio:       bookFields.isAudio.optional(),
  image:         bookFields.image,
  price:         bookFields.price,
  isbn:          bookFields.isbn,
  edition:       bookFields.edition,
  publisherCity: bookFields.publisherCity,
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "حداقل یک فیلد برای ویرایش باید ارسال شود" }
);

// ─── پارامترهای query برای لیست کتاب‌ها ─────────────────────────────────────
export const getBooksQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(12),
  search:   z.string().trim().optional(),
  category: z.string().trim().optional(),
  isAudio:  z.enum(["true", "false"]).optional(),
  sortBy:   z.enum(["newest", "oldest", "title", "price_asc", "price_desc"]).default("newest"),
});
