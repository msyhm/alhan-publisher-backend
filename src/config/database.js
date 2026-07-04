/**
 * database.js
 * ─────────────────────────────────────────────────────────────────────────
 * اتصال به دیتابیس از طریق Prisma Client
 * مسیر فایل: src/config/database.js
 */
import { PrismaClient } from "@prisma/client";

// ✅ یک نمونه واحد از PrismaClient در کل پروژه (الگوی singleton)
// از باز شدن چندین connection غیرضروری جلوگیری می‌کند
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

/**
 * تست اتصال به دیتابیس هنگام راه‌اندازی سرور
 * اگر دیتابیس در دسترس نباشد، سرور بالا نمی‌آید (fail-fast)
 */
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ اتصال به دیتابیس برقرار شد");
  } catch (err) {
    console.error("❌ خطا در اتصال به دیتابیس:", err.message);
    throw err;
  }
}

/**
 * بستن تمیز اتصال دیتابیس هنگام خاموش شدن سرور
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// ✅ مدیریت خروج تمیز از برنامه
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});
