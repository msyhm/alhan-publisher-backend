/**
 * trackingCode.js
 * ─────────────────────────────────────────────────────────────────────────
 * تولید کد پیگیری منحصربه‌فرد برای آثار ارسالی
 * مسیر فایل: src/utils/trackingCode.js
 */
import { prisma } from "../config/database.js";

/**
 * تولید کد پیگیری به فرمت AL-XXXXXX
 * مثال: AL-482931
 * ✅ تکراری نبودن در دیتابیس بررسی می‌شود
 */
export async function generateTrackingCode() {
  let code;
  let isUnique = false;

  while (!isUnique) {
    const random = Math.floor(100000 + Math.random() * 900000);
    code = `AL-${random}`;

    const existing = await prisma.submission.findUnique({
      where: { trackingCode: code },
    });
    if (!existing) isUnique = true;
  }

  return code;
}
