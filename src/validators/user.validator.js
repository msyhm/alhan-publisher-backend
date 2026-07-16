import { z } from "zod";

export const registerSchema = z.object({
  name: z.string({ required_error: "نام الزامی است" }).min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100).trim(),
  email: z.string({ required_error: "ایمیل الزامی است" }).email("ایمیل معتبر نیست").trim().toLowerCase(),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست").optional().nullable(),
  password: z.string({ required_error: "رمز عبور الزامی است" }).min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").max(72),
});

export const loginSchema = z.object({
  email: z.string({ required_error: "ایمیل الزامی است" }).email("ایمیل معتبر نیست").trim().toLowerCase(),
  password: z.string({ required_error: "رمز عبور الزامی است" }).min(1),
});