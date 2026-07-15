import { prisma }   from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";

export async function getApprovedReviewsForBook(bookId) {
  return prisma.review.findMany({
    where:   { bookId: parseInt(bookId), status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(bookId, data) {
  const book = await prisma.book.findUnique({ where: { id: parseInt(bookId) } });
  if (!book) throw new AppError("کتاب پیدا نشد", 404);
  return prisma.review.create({
    data: { bookId: parseInt(bookId), name: data.name, rating: data.rating ?? null, comment: data.comment, status: "PENDING" },
  });
}

export async function getAllReviews(query) {
  const page = query.page || 1, limit = query.limit || 20;
  const where = query.status ? { status: query.status } : {};
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where, include: { book: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
    }),
    prisma.review.count({ where }),
  ]);
  return { reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateReviewStatus(id, status) {
  const existing = await prisma.review.findUnique({ where: { id: parseInt(id) } });
  if (!existing) throw new AppError("نظر پیدا نشد", 404);
  return prisma.review.update({ where: { id: parseInt(id) }, data: { status } });
}

export async function deleteReview(id) {
  const existing = await prisma.review.findUnique({ where: { id: parseInt(id) } });
  if (!existing) throw new AppError("نظر پیدا نشد", 404);
  await prisma.review.delete({ where: { id: parseInt(id) } });
}