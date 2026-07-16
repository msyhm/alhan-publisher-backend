/**
 * server.js
 * ─────────────────────────────────────────────────────────────────────────
 * نقطه ورود اصلی بکند انتشارات الحان
 * مسیر فایل: src/server.js
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import reviewsRoutes from "./routes/reviews.routes.js";

import { connectDatabase } from "./config/database.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 4000;

// ─── میدلورهای امنیتی و پایه ──────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // ✅ برای ارسال httpOnly cookie (JWT)
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── فایل‌های آپلودشده (تصاویر، اسناد) ────────────────────────────────────
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "./uploads"));

// ─── health check — برای بررسی آنلاین بودن سرور ──────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── روت‌های اصلی API ──────────────────────────────────────────────────────────
import authRoutes        from "./routes/auth.routes.js";
import booksRoutes       from "./routes/books.routes.js";
import authorsRoutes     from "./routes/authors.routes.js";
import messagesRoutes    from "./routes/messages.routes.js";
import submissionsRoutes from "./routes/submissions.routes.js";
import settingsRoutes    from "./routes/settings.routes.js";
import uploadRoutes      from "./routes/upload.routes.js";
import usersRoutes       from "./routes/users.routes.js";

app.use("/api/auth",        authRoutes);
app.use("/api/books",       booksRoutes);
app.use("/api/authors",     authorsRoutes);
app.use("/api/messages",    messagesRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/settings",    settingsRoutes);
app.use("/api/upload",      uploadRoutes);
app.use("/api/reviews",     reviewsRoutes);
app.use("/api/users",       usersRoutes);

// ─── مدیریت خطاها ──────────────────────────────────────────────────────────
app.use(notFoundHandler); // مسیر ناشناخته → 404
app.use(errorHandler);    // خطای داخلی → 500 با پیام مناسب

// ─── راه‌اندازی سرور ───────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`✅ سرور انتشارات الحان روی پورت ${PORT} اجرا شد`);
      console.log(`   محیط: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ خطا در راه‌اندازی سرور:", err);
    process.exit(1);
  }
}

startServer();
