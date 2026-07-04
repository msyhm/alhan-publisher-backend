/**
 * notFoundHandler.js
 * ─────────────────────────────────────────────────────────────────────────
 * وقتی هیچ روتی با درخواست مطابقت نداشته باشد
 * مسیر فایل: src/middlewares/notFoundHandler.js
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.method} ${req.originalUrl} پیدا نشد`,
  });
}
