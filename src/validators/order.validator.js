import { z } from "zod";

export const createOrderSchema = z.object({
  fullName: z.string({ required_error: "نام گیرنده الزامی است" }).min(2).max(100).trim(),
  phone:    z.string({ required_error: "شماره موبایل الزامی است" }).regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  province: z.string({ required_error: "استان الزامی است" }).min(2).max(50).trim(),
  city:     z.string({ required_error: "شهر الزامی است" }).min(2).max(50).trim(),
  postalCode: z.string({ required_error: "کد پستی الزامی است" }).regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد"),
  addressLine: z.string({ required_error: "آدرس الزامی است" }).min(5, "آدرس خیلی کوتاه است").max(300).trim(),
  items: z.array(
    z.object({ bookId: z.number().int().positive(), quantity: z.number().int().positive().max(20) })
  ).min(1, "سبد خرید خالی است"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], {
    required_error: "وضعیت الزامی است",
  }),
});