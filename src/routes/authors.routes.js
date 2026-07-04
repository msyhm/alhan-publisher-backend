/**
 * authors.routes.js
 * ─────────────────────────────────────────────────────────────────────────
 * مسیر فایل: src/routes/authors.routes.js
 *
 * Public:
 *   GET  /api/authors
 *   GET  /api/authors/:id
 *
 * Protected:
 *   POST   /api/authors
 *   PUT    /api/authors/:id
 *   DELETE /api/authors/:id
 *   PATCH  /api/authors/:id/status
 */
import { Router } from "express";
import { requireAuth, validate } from "../middlewares/authMiddleware.js";
import { createAuthorSchema, updateAuthorSchema } from "../validators/author.validator.js";
import {
  getAuthors, getAuthor, createAuthor,
  updateAuthor, deleteAuthor, toggleStatus,
} from "../controllers/authors.controller.js";

const router = Router();

// Public
router.get("/",    getAuthors);
router.get("/:id", getAuthor);

// Protected
router.post(  "/",           requireAuth, validate(createAuthorSchema), createAuthor);
router.put(   "/:id",        requireAuth, validate(updateAuthorSchema), updateAuthor);
router.delete("/:id",        requireAuth,                               deleteAuthor);
router.patch( "/:id/status", requireAuth,                               toggleStatus);

export default router;
