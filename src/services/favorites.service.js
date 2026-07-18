import { prisma }   from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";

export async function addFavorite(userId, bookId) {
  const book = await prisma.book.findUnique({ where: { id: parseInt(bookId) } });
  if (!book) throw new AppError("کتاب پیدا نشد", 404);

  try {
    return await prisma.favorite.create({ data: { userId, bookId: parseInt(bookId) } });
  } catch (err) {
    if (err.code === "P2002") throw new AppError("این کتاب قبلاً به علاقه‌مندی‌ها اضافه شده است", 409);
    throw err;
  }
}

export async function removeFavorite(userId, bookId) {
  await prisma.favorite.deleteMany({ where: { userId, bookId: parseInt(bookId) } });
}

export async function getFavoritesForUser(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId }, include: { book: true }, orderBy: { createdAt: "desc" },
  });
  return favorites.map((f) => f.book);
}