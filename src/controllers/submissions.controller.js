/**
 * submissions.controller.js
 * ─────────────────────────────────────────────────────────────────────────
 * مسیر فایل: src/controllers/submissions.controller.js
 */
import * as submissionsService from "../services/submissions.service.js";
import {
  getSubmissionsQuerySchema,
  updateStatusSchema,
} from "../validators/submission.validator.js";

// ─── GET /api/submissions (ادمین) ─────────────────────────────────────────────
export async function getSubmissions(req, res, next) {
  try {
    const query  = getSubmissionsQuerySchema.parse(req.query);
    const result = await submissionsService.getAllSubmissions(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/submissions/:id (ادمین) ────────────────────────────────────────
export async function getSubmission(req, res, next) {
  try {
    const submission = await submissionsService.getSubmissionById(req.params.id);
    res.json({ success: true, submission });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/submissions/track/:code (عمومی — پیگیری) ───────────────────────
export async function trackSubmission(req, res, next) {
  try {
    const submission = await submissionsService.getSubmissionByTrackingCode(
      req.params.code
    );
    res.json({ success: true, submission });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/submissions (عمومی) ───────────────────────────────────────────
export async function createSubmission(req, res, next) {
  try {
    const submission = await submissionsService.createSubmission(req.body);
    res.status(201).json({
      success:      true,
      message:      "اثر شما با موفقیت ثبت شد",
      id:           submission.id,
      trackingCode: submission.trackingCode,
    });

  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/submissions/:id/status (ادمین) ────────────────────────────────
export async function updateStatus(req, res, next) {
  try {
    const { status } = updateStatusSchema.parse(req.body);
    const result = await submissionsService.updateSubmissionStatus(
      req.params.id,
      status
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/submissions/:id (ادمین) ──────────────────────────────────────
export async function deleteSubmission(req, res, next) {
  try {
    const result = await submissionsService.deleteSubmission(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
