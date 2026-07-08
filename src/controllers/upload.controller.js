/**
 * upload.controller.js
 * ─────────────────────────────────────────────────────────────────────────
 * مدیریت آپلود فایل‌ها
 * مسیر فایل: src/controllers/upload.controller.js
 */
import { getFileUrl, deleteFile } from "../middlewares/upload.js";
import { prisma }                 from "../config/database.js";
import { AppError }               from "../middlewares/errorHandler.js";

// ─── POST /api/upload/books/:id/image ────────────────────────────────────────
// آپلود تصویر جلد کتاب
export async function uploadBookImage(req, res, next) {
  try {
    if (!req.file) throw new AppError("فایلی آپلود نشد", 400);

    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!book) {
      // اگر کتاب پیدا نشد فایل آپلودشده را حذف کن
      deleteFile(req.file.path);
      throw new AppError("کتاب پیدا نشد", 404);
    }

    const imageUrl = getFileUrl(req, req.file.path);

    // ✅ حذف تصویر قدیمی از disk (اگر از سرور ما بود)
    if (book.image?.includes("/uploads/")) {
      deleteFile(book.image);
    }

    // آپدیت در دیتابیس
    const updated = await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data:  { image: imageUrl },
    });

    res.json({
      success:  true,
      message:  "تصویر جلد کتاب آپلود شد",
      imageUrl,
      book:     updated,
    });
  } catch (err) {
    // اگر خطا رخ داد، فایل آپلودشده را پاک کن
    if (req.file) deleteFile(req.file.path);
    next(err);
  }
}

// ─── POST /api/upload/authors/:id/avatar ────────────────────────────────────
// آپلود آواتار نویسنده
export async function uploadAuthorAvatar(req, res, next) {
  try {
    if (!req.file) throw new AppError("فایلی آپلود نشد", 400);

    const author = await prisma.author.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!author) {
      deleteFile(req.file.path);
      throw new AppError("نویسنده پیدا نشد", 404);
    }

    const avatarUrl = getFileUrl(req, req.file.path);

    // حذف آواتار قدیمی
    if (author.avatar?.includes("/uploads/")) {
      deleteFile(author.avatar);
    }

    const updated = await prisma.author.update({
      where: { id: parseInt(req.params.id) },
      data:  { avatar: avatarUrl },
    });

    res.json({
      success:   true,
      message:   "آواتار نویسنده آپلود شد",
      avatarUrl,
      author:    updated,
    });
  } catch (err) {
    if (req.file) deleteFile(req.file.path);
    next(err);
  }
}

// ─── POST /api/upload/submissions/:id/file ───────────────────────────────────
// آپلود فایل اثر ارسالی
export async function uploadSubmissionFile(req, res, next) {
  try {
    if (!req.file) throw new AppError("فایلی آپلود نشد", 400);

    const submission = await prisma.submission.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!submission) {
      deleteFile(req.file.path);
      throw new AppError("اثر ارسالی پیدا نشد", 404);
    }

    // ✅ FIX: چون این endpoint بدون لاگین (عمومی) است، باید جلوی سوءاستفاده گرفته شود
    // فقط تا ۱۰ دقیقه بعد از ثبت اثر و فقط یک‌بار (وقتی هنوز فایلی ندارد) اجازه آپلود می‌دهیم
    const TEN_MINUTES = 10 * 60 * 1000;
    const isRecent = Date.now() - new Date(submission.submittedAt).getTime() < TEN_MINUTES;

    if (submission.hasFile) {
      deleteFile(req.file.path);
      throw new AppError("برای این اثر قبلاً فایلی ثبت شده است", 409);
    }
    if (!isRecent) {
      deleteFile(req.file.path);
      throw new AppError("زمان مجاز برای آپلود فایل این اثر به پایان رسیده است", 403);
    }

    const fileUrl = getFileUrl(req, req.file.path);

    // حذف فایل قدیمی اگر وجود داشت
    if (submission.fileUrl?.includes("/uploads/")) {
      deleteFile(submission.fileUrl);
    }

    const updated = await prisma.submission.update({
      where: { id: parseInt(req.params.id) },
      data: {
        fileUrl:  fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        hasFile:  true,
      },
    });

    res.json({
      success:  true,
      message:  "فایل اثر آپلود شد",
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (err) {
    if (req.file) deleteFile(req.file.path);
    next(err);
  }
}

// ─── DELETE /api/upload/books/:id/image ──────────────────────────────────────
// حذف تصویر کتاب
export async function deleteBookImage(req, res, next) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!book) throw new AppError("کتاب پیدا نشد", 404);

    if (book.image?.includes("/uploads/")) {
      deleteFile(book.image);
    }

    await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data:  { image: null },
    });

    res.json({ success: true, message: "تصویر کتاب حذف شد" });
  } catch (err) {
    next(err);
  }
}
