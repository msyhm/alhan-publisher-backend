import * as reviewsService from "../services/reviews.service.js";
import { getReviewsQuerySchema } from "../validators/review.validator.js";

export async function getBookReviews(req, res, next) {
  try {
    const reviews = await reviewsService.getApprovedReviewsForBook(req.params.bookId);
    res.json({ success: true, reviews });
  } catch (err) { next(err); }
}

export async function createBookReview(req, res, next) {
  try {
    await reviewsService.createReview(req.params.bookId, req.body);
    res.status(201).json({ success: true, message: "نظر شما ثبت شد و پس از بررسی نمایش داده می‌شود" });
  } catch (err) { next(err); }
}

export async function getReviews(req, res, next) {
  try {
    const query = getReviewsQuerySchema.parse(req.query);
    const result = await reviewsService.getAllReviews(query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function updateStatus(req, res, next) {
  try {
    const review = await reviewsService.updateReviewStatus(req.params.id, req.body.status);
    res.json({ success: true, message: "وضعیت نظر به‌روزرسانی شد", review });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await reviewsService.deleteReview(req.params.id);
    res.json({ success: true, message: "نظر حذف شد" });
  } catch (err) { next(err); }
}