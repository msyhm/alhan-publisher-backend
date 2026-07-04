/**
 * books.controller.js
 * ─────────────────────────────────────────────────────────────────────────
 * کنترلر کتاب‌ها — خواندن req، صدا زدن service، فرستادن res
 * مسیر فایل: src/controllers/books.controller.js
 */
import * as booksService from "../services/books.service.js";
import { getBooksQuerySchema } from "../validators/book.validator.js";
import { AppError } from "../middlewares/errorHandler.js";

// ─── GET /api/books ───────────────────────────────────────────────────────────
export async function getBooks(req, res, next) {
  try {
    // اعتبارسنجی و parse پارامترهای query
    const query = getBooksQuerySchema.parse(req.query);
    const result = await booksService.getAllBooks(query);

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/books/categories ────────────────────────────────────────────────
export async function getCategories(req, res, next) {
  try {
    const categories = await booksService.getCategories();
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/books/:id ───────────────────────────────────────────────────────
export async function getBook(req, res, next) {
  try {
    const book = await booksService.getBookById(req.params.id);
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/books (ادمین) ──────────────────────────────────────────────────
export async function createBook(req, res, next) {
  try {
    const book = await booksService.createBook(req.body);
    res.status(201).json({
      success: true,
      message: `کتاب "${book.title}" با موفقیت اضافه شد`,
      book,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/books/:id (ادمین) ───────────────────────────────────────────────
export async function updateBook(req, res, next) {
  try {
    const book = await booksService.updateBook(req.params.id, req.body);
    res.json({
      success: true,
      message: `کتاب "${book.title}" ویرایش شد`,
      book,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/books/:id (ادمین) ───────────────────────────────────────────
export async function deleteBook(req, res, next) {
  try {
    const result = await booksService.deleteBook(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
