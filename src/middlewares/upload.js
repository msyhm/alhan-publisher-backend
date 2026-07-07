/**
 * upload.js
 * ─────────────────────────────────────────────────────────────────────────
 * تنظیمات multer برای آپلود فایل
 * مسیر فایل: src/middlewares/upload.js
 */
import multer from "multer";
import path   from "path";
import fs     from "fs";

const UPLOAD_DIR     = process.env.UPLOAD_DIR || "./uploads";
const MAX_SIZE_MB    = parseInt(process.env.MAX_FILE_SIZE_MB || "20");
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─── ساخت پوشه‌ها اگر وجود ندارند ────────────────────────────────────────────
["books", "authors", "submissions"].forEach((folder) => {
  const dir = path.join(UPLOAD_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── تعیین مسیر و نام فایل ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // مسیر بر اساس نوع آپلود (از req.uploadFolder که در route تنظیم می‌شود)
    const folder = req.uploadFolder || "books";
    cb(null, path.join(UPLOAD_DIR, folder));
  },

  filename: (req, file, cb) => {
    // نام فایل: timestamp + random + پسوند اصلی
    // مثال: 1704067200000-482931.jpg
    const ext      = path.extname(file.originalname).toLowerCase();
    const unique   = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    cb(null, `${unique}${ext}`);
  },
});

// ─── فیلتر نوع فایل ───────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext     = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("فقط فایل‌های تصویری JPG، PNG و WEBP مجاز هستند"), false);
  }
  cb(null, true);
};

const documentFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext     = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("فقط فایل‌های PDF، DOC و DOCX مجاز هستند"), false);
  }
  cb(null, true);
};

// ─── instance های multer ──────────────────────────────────────────────────────

// ✅ آپلود تصویر — برای جلد کتاب و آواتار نویسنده
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // حداکثر ۵ مگابایت برای تصویر
}).single("image");

// ✅ آپلود سند — برای فایل آثار ارسالی
export const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
}).single("file");

// ─── wrapper برای مدیریت خطای multer ─────────────────────────────────────────
// multer خطاها را به صورت متفاوت throw می‌کند — باید wrap شود
export function handleUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new Error(`حجم فایل نباید بیشتر از ${MAX_SIZE_MB} مگابایت باشد`));
        }
        return next(new Error("خطا در آپلود فایل"));
      }
      next(err); // خطای fileFilter
    });
  };
}

// ─── helper: ساخت URL عمومی فایل ─────────────────────────────────────────────
export function getFileUrl(req, filePath) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const unixPath = filePath.replace(/\\/g, "/");
  const idx = unixPath.indexOf("uploads/");
  const normalized = "/" + (idx !== -1 ? unixPath.slice(idx) : unixPath.replace(/^\/+/, ""));
  return `${baseUrl}${normalized}`;
}


// ─── helper: حذف فایل قدیمی هنگام جایگزینی ──────────────────────────────────
export function deleteFile(filePath) {
  if (!filePath) return;
  try {
    // تبدیل URL به مسیر فایل
    const localPath = filePath.includes("/uploads/")
      ? "." + filePath.substring(filePath.indexOf("/uploads/"))
      : filePath;

    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  } catch {
    // حذف نشد — ایرادی ندارد، ادامه می‌دهیم
  }
}
