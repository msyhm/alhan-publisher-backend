/**
 * submissions.service.js
 * ─────────────────────────────────────────────────────────────────────────
 * منطق دیتابیس برای آثار ارسالی
 * مسیر فایل: src/services/submissions.service.js
 */
import { prisma } from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";
import { generateTrackingCode } from "../utils/trackingCode.js";

// ─── لیست آثار ارسالی (ادمین) ────────────────────────────────────────────────
export async function getAllSubmissions({ page, limit, search, status, category }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { title:    { contains: search, mode: "insensitive" } },
        { email:    { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status !== "all" && { status }),
    ...(category && { category: { contains: category, mode: "insensitive" } }),
  };

  const [submissions, total, pendingCount] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.submission.count({ where }),
    // تعداد آثار در انتظار بررسی — برای badge داشبورد
    prisma.submission.count({ where: { status: "PENDING" } }),
  ]);

  return {
    submissions,
    pendingCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext:    page < Math.ceil(total / limit),
      hasPrev:    page > 1,
    },
  };
}

// ─── دریافت یک اثر ───────────────────────────────────────────────────────────
export async function getSubmissionById(id) {
  const submission = await prisma.submission.findUnique({
    where: { id: parseInt(id) },
  });
  if (!submission) throw new AppError("اثر ارسالی پیدا نشد", 404);
  return submission;
}

// ─── پیدا کردن با کد پیگیری (عمومی) ─────────────────────────────────────────
export async function getSubmissionByTrackingCode(trackingCode) {
  const submission = await prisma.submission.findUnique({
    where:  { trackingCode },
    // ✅ اطلاعات محدود — فرستنده نباید اطلاعات داخلی ببیند
    select: {
      trackingCode: true,
      title:        true,
      fullName:     true,
      status:       true,
      submittedAt:  true,
    },
  });
  if (!submission) throw new AppError("کدی با این مشخصات پیدا نشد", 404);
  return submission;
}

// ─── ثبت اثر جدید ────────────────────────────────────────────────────────────
export async function createSubmission(data) {
  const trackingCode = await generateTrackingCode();
  return prisma.submission.create({
    data: { ...data, trackingCode },
  });
}

// ─── آپدیت وضعیت (ادمین) ─────────────────────────────────────────────────────
export async function updateSubmissionStatus(id, status) {
  const existing = await prisma.submission.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existing) throw new AppError("اثر ارسالی پیدا نشد", 404);

  const updated = await prisma.submission.update({
    where: { id: parseInt(id) },
    data:  { status },
  });

  const statusLabels = {
    PENDING:   "در انتظار بررسی",
    REVIEWING: "در حال بررسی",
    APPROVED:  "تأیید شده",
    REJECTED:  "رد شده",
  };

  return {
    ...updated,
    message: `وضعیت اثر "${existing.title}" به "${statusLabels[status]}" تغییر یافت`,
  };
}

// ─── حذف اثر (ادمین) ──────────────────────────────────────────────────────────
export async function deleteSubmission(id) {
  const existing = await prisma.submission.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existing) throw new AppError("اثر ارسالی پیدا نشد", 404);

  await prisma.submission.delete({ where: { id: parseInt(id) } });
  return { success: true, message: `اثر "${existing.title}" حذف شد` };
}
