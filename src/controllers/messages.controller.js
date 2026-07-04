/**
 * messages.controller.js
 * ─────────────────────────────────────────────────────────────────────────
 * مسیر فایل: src/controllers/messages.controller.js
 */
import * as messagesService from "../services/messages.service.js";
import { getMessagesQuerySchema } from "../validators/message.validator.js";

// ─── GET /api/messages (ادمین) ────────────────────────────────────────────────
export async function getMessages(req, res, next) {
  try {
    const query  = getMessagesQuerySchema.parse(req.query);
    const result = await messagesService.getAllMessages(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/messages/:id (ادمین) ───────────────────────────────────────────
export async function getMessage(req, res, next) {
  try {
    const message = await messagesService.getMessageById(req.params.id);
    res.json({ success: true, message });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/messages (عمومی — فرم تماس) ───────────────────────────────────
export async function createMessage(req, res, next) {
  try {
    const message = await messagesService.createMessage(req.body);
    res.status(201).json({
      success: true,
      message: "پیام شما با موفقیت ارسال شد",
      id:      message.id,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/messages/read-all (ادمین) ────────────────────────────────────
export async function markAllAsRead(req, res, next) {
  try {
    const result = await messagesService.markAllAsRead();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/messages/:id (ادمین) ────────────────────────────────────────
export async function deleteMessage(req, res, next) {
  try {
    const result = await messagesService.deleteMessage(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
