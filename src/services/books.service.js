/**
 * books.service.js
 * ─────────────────────────────────────────────────────────────────────────
 * منطق دیتابیس برای کتاب‌ها — کار مستقیم با Prisma
 * مسیر فایل: src/services/books.service.js
 */
import { prisma } from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";

// ─── دریافت لیست کتاب‌ها با فیلتر، جستجو و صفحه‌بندی ───────────────────────
export async function getAllBooks({ page, limit, search, category, isAudio, sortBy }) {
  const skip = (page - 1) * limit;

  // ساخت شرط WHERE بر اساس پارامترهای دریافتی
  const where = {
    ...(search && {
      OR: [
        { title:       { contains: search, mode: "insensitive" } },
        { authorName:  { contains: search, mode: "insensitive" } },
        { category:    { contains: search, mode: "insensitive" } },
        { isbn:        { contains: search } },
        { author: { name: { contains: search, mode: "insensitive" } } },
      ],
    }),
    ...(category && { category: { equals: category, mode: "insensitive" } }),
    ...(isAudio !== undefined && { isAudio: isAudio === "true" }),
  };

  // مرتب‌سازی
  const orderBy = {
    newest:     { createdAt: "desc" },
    oldest:     { createdAt: "asc"  },
    title:      { title:     "asc"  },
    price_asc:  { price:     "asc"  },
    price_desc: { price:     "desc" },
  }[sortBy] || { createdAt: "desc" };

  // اجرای همزمان query اصلی و شمارش کل
  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, field: true, avatar: true },
        },
      },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

// ─── دریافت یک کتاب با id ────────────────────────────────────────────────────
export async function getBookById(id) {
  const book = await prisma.book.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: {
        select: { id: true, name: true, field: true, avatar: true, bio: true },
      },
    },
  });

  if (!book) throw new AppError("کتاب پیدا نشد", 404);
  return book;
}

// ─── ساخت کتاب جدید ──────────────────────────────────────────────────────────
export async function createBook(data) {
  // اگر isbn داده شده، بررسی تکراری نبودن
  if (data.isbn) {
    const existing = await prisma.book.findUnique({ where: { isbn: data.isbn } });
    if (existing) throw new AppError("این شابک (ISBN) قبلاً ثبت شده است", 409);
  }

  // اگر authorId داده شده، بررسی وجود نویسنده
  if (data.authorId) {
    const author = await prisma.author.findUnique({ where: { id: data.authorId } });
    if (!author) throw new AppError("نویسنده‌ای با این شناسه پیدا نشد", 404);
    // پر کردن خودکار authorName از جدول authors
    data.authorName = author.name;
  }

  return prisma.book.create({
    data,
    include: {
      author: { select: { id: true, name: true } },
    },
  });
}

// ─── ویرایش کتاب ─────────────────────────────────────────────────────────────
export async function updateBook(id, data) {
  // بررسی وجود کتاب
  const existing = await prisma.book.findUnique({ where: { id: parseInt(id) } });
  if (!existing) throw new AppError("کتاب پیدا نشد", 404);

  // بررسی isbn تکراری (اگر تغییر کرده)
  if (data.isbn && data.isbn !== existing.isbn) {
    const duplicate = await prisma.book.findUnique({ where: { isbn: data.isbn } });
    if (duplicate) throw new AppError("این شابک (ISBN) قبلاً ثبت شده است", 409);
  }

  // sync کردن authorName اگر authorId تغییر کرده
  if (data.authorId && data.authorId !== existing.authorId) {
    const author = await prisma.author.findUnique({ where: { id: data.authorId } });
    if (!author) throw new AppError("نویسنده‌ای با این شناسه پیدا نشد", 404);
    data.authorName = author.name;
  }

  return prisma.book.update({
    where: { id: parseInt(id) },
    data,
    include: {
      author: { select: { id: true, name: true } },
    },
  });
}

// ─── حذف کتاب ────────────────────────────────────────────────────────────────
export async function deleteBook(id) {
  const existing = await prisma.book.findUnique({ where: { id: parseInt(id) } });
  if (!existing) throw new AppError("کتاب پیدا نشد", 404);

  await prisma.book.delete({ where: { id: parseInt(id) } });
  return { success: true, message: `کتاب "${existing.title}" حذف شد` };
}

// ─── دریافت دسته‌بندی‌های موجود ──────────────────────────────────────────────
export async function getCategories() {
  const categories = await prisma.book.findMany({
    where:   { category: { not: null } },
    select:  { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return categories.map((c) => c.category);
}
