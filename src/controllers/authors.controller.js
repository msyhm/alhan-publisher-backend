/**
 * authors.controller.js
 * ─────────────────────────────────────────────────────────────────────────
 * کنترلر نویسندگان
 * مسیر فایل: src/controllers/authors.controller.js
 */
import * as authorsService from "../services/authors.service.js";
import {
  getAuthorsQuerySchema,
  toggleStatusSchema,
} from "../validators/author.validator.js";

// ─── GET /api/authors ─────────────────────────────────────────────────────────
export async function getAuthors(req, res, next) {
  try {
    const query  = getAuthorsQuerySchema.parse(req.query);
    const result = await authorsService.getAllAuthors(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/authors/:id ─────────────────────────────────────────────────────
export async function getAuthor(req, res, next) {
  try {
    const author = await authorsService.getAuthorById(req.params.id);
    res.json({ success: true, author });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/authors (ادمین) ────────────────────────────────────────────────
export async function createAuthor(req, res, next) {
  try {
    const author = await authorsService.createAuthor(req.body);
    res.status(201).json({
      success: true,
      message: `نویسنده "${author.name}" اضافه شد`,
      author,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/authors/:id (ادمین) ─────────────────────────────────────────────
export async function updateAuthor(req, res, next) {
  try {
    const author = await authorsService.updateAuthor(req.params.id, req.body);
    res.json({
      success: true,
      message: `اطلاعات "${author.name}" ویرایش شد`,
      author,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/authors/:id (ادمین) ──────────────────────────────────────────
export async function deleteAuthor(req, res, next) {
  try {
    const result = await authorsService.deleteAuthor(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/authors/:id/status (ادمین) ────────────────────────────────────
export async function toggleStatus(req, res, next) {
  try {
    const { status } = toggleStatusSchema.parse(req.body);
    const result = await authorsService.toggleAuthorStatus(req.params.id, status);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
