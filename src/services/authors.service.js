/**
 * authors.service.js
 * ─────────────────────────────────────────────────────────────────────────
 * منطق دیتابیس برای نویسندگان
 * مسیر فایل: src/services/authors.service.js
 */
import { prisma } from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";

// ─── دریافت لیست نویسندگان ───────────────────────────────────────────────────
export async function getAllAuthors({ page, limit, search, status, field }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { name:  { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { field: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status !== "all" && { status }),
    ...(field && { field: { contains: field, mode: "insensitive" } }),
  };

  const [authors, total] = await Promise.all([
    prisma.author.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        // تعداد کتاب‌های هر نویسنده
        _count: { select: { books: true } },
      },
    }),
    prisma.author.count({ where }),
  ]);

  // اضافه کردن bookCount به هر نویسنده
  const authorsWithCount = authors.map(({ _count, ...author }) => ({
    ...author,
    bookCount: _count.books,
  }));

  return {
    authors: authorsWithCount,
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

// ─── دریافت یک نویسنده با کتاب‌هایش ─────────────────────────────────────────
export async function getAuthorById(id) {
  const author = await prisma.author.findUnique({
    where: { id: parseInt(id) },
    include: {
      books: {
        select: {
          id: true, title: true, image: true,
          category: true, year: true, price: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { books: true } },
    },
  });

  if (!author) throw new AppError("نویسنده پیدا نشد", 404);

  const { _count, ...rest } = author;
  return { ...rest, bookCount: _count.books };
}

// ─── ساخت نویسنده جدید ───────────────────────────────────────────────────────
export async function createAuthor(data) {
  // بررسی ایمیل تکراری
  if (data.email) {
    const existing = await prisma.author.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("این ایمیل قبلاً ثبت شده است", 409);
  }

  return prisma.author.create({ data });
}

// ─── ویرایش نویسنده ───────────────────────────────────────────────────────────
export async function updateAuthor(id, data) {
  const existing = await prisma.author.findUnique({ where: { id: parseInt(id) } });
  if (!existing) throw new AppError("نویسنده پیدا نشد", 404);

  // بررسی ایمیل تکراری (اگر تغییر کرده)
  if (data.email && data.email !== existing.email) {
    const duplicate = await prisma.author.findUnique({ where: { email: data.email } });
    if (duplicate) throw new AppError("این ایمیل قبلاً ثبت شده است", 409);
  }

  return prisma.author.update({
    where: { id: parseInt(id) },
    data,
  });
}

// ─── حذف نویسنده ─────────────────────────────────────────────────────────────
export async function deleteAuthor(id) {
  const existing = await prisma.author.findUnique({
    where:   { id: parseInt(id) },
    include: { _count: { select: { books: true } } },
  });

  if (!existing) throw new AppError("نویسنده پیدا نشد", 404);

  // ✅ هشدار اگر نویسنده کتاب دارد (حذف نمی‌شود — کتاب‌ها authorId=null می‌شوند)
  await prisma.author.delete({ where: { id: parseInt(id) } });

  return {
    success: true,
    message: `نویسنده "${existing.name}" حذف شد`,
    affectedBooks: existing._count.books,
  };
}

// ─── تغییر وضعیت فعال/غیرفعال ────────────────────────────────────────────────
export async function toggleAuthorStatus(id, status) {
  const existing = await prisma.author.findUnique({ where: { id: parseInt(id) } });
  if (!existing) throw new AppError("نویسنده پیدا نشد", 404);

  const updated = await prisma.author.update({
    where: { id: parseInt(id) },
    data:  { status },
  });

  return {
    ...updated,
    message: status === "ACTIVE"
      ? `نویسنده "${updated.name}" فعال شد`
      : `نویسنده "${updated.name}" غیرفعال شد`,
  };
}
