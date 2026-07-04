/**
 * messages.service.js
 * ─────────────────────────────────────────────────────────────────────────
 * منطق دیتابیس برای پیام‌های تماس
 * مسیر فایل: src/services/messages.service.js
 */
import { prisma } from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";

// ─── دریافت لیست پیام‌ها (ادمین) ─────────────────────────────────────────────
export async function getAllMessages({ page, limit, search, isRead }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { name:    { contains: search, mode: "insensitive" } },
        { email:   { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(isRead !== "all" && { isRead: isRead === "true" }),
  };

  const [messages, total, unreadCount] = await Promise.all([
    prisma.message.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { sentAt: "desc" },
    }),
    prisma.message.count({ where }),
    // ✅ تعداد کل نخوانده‌ها — برای badge ادمین
    prisma.message.count({ where: { isRead: false } }),
  ]);

  return {
    messages,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext:    page < Math.ceil(total / limit),
      hasPrev:    page > 1,
    },
  };
}

// ─── دریافت یک پیام و علامت‌زدن به عنوان خوانده‌شده ─────────────────────────
export async function getMessageById(id) {
  const message = await prisma.message.findUnique({
    where: { id: parseInt(id) },
  });
  if (!message) throw new AppError("پیام پیدا نشد", 404);

  // ✅ اگر نخوانده بود، خودکار خوانده علامت بزن
  if (!message.isRead) {
    await prisma.message.update({
      where: { id: parseInt(id) },
      data:  { isRead: true },
    });
    return { ...message, isRead: true };
  }

  return message;
}

// ─── ارسال پیام جدید (از فرم تماس عمومی) ────────────────────────────────────
export async function createMessage(data) {
  return prisma.message.create({ data });
}

// ─── علامت‌زدن همه پیام‌ها به عنوان خوانده‌شده ───────────────────────────────
export async function markAllAsRead() {
  const result = await prisma.message.updateMany({
    where: { isRead: false },
    data:  { isRead: true },
  });
  return {
    success: true,
    count:   result.count,
    message: `${result.count} پیام خوانده‌شده علامت خورد`,
  };
}

// ─── حذف پیام ────────────────────────────────────────────────────────────────
export async function deleteMessage(id) {
  const existing = await prisma.message.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existing) throw new AppError("پیام پیدا نشد", 404);

  await prisma.message.delete({ where: { id: parseInt(id) } });
  return { success: true, message: `پیام از "${existing.name}" حذف شد` };
}
