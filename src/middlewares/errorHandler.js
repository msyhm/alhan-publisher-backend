/**
 * errorHandler.js
 * ─────────────────────────────────────────────────────────────────────────
 * گرفتن متمرکز همه خطاهای رخ‌داده در route handlerها
 * مسیر فایل: src/middlewares/errorHandler.js
 *
 * نکته: این middleware باید آخرین app.use() در server.js باشد
 */
export function errorHandler(err, req, res, next) {
  console.error("❌ خطا:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // خطاهای اعتبارسنجی Zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "اطلاعات ارسالی نامعتبر است",
      errors: err.errors,
    });
  }

  // خطاهای Prisma (مثلاً رکورد تکراری، رکورد پیدا نشد)
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "این مقدار قبلاً ثبت شده است",
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "رکورد مورد نظر پیدا نشد",
    });
  }

  // خطای سفارشی با statusCode مشخص
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "خطای داخلی سرور رخ داد"
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
}

/**
 * کلاس خطای سفارشی — برای پرتاب خطا با statusCode مشخص از هر جای کد
 * مثال استفاده: throw new AppError("کتاب پیدا نشد", 404);
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
