import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate, requireUserAuth } from "../middlewares/authMiddleware.js";
import { registerSchema, loginSchema } from "../validators/user.validator.js";
import { register, login, me } from "../controllers/users.controller.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "تعداد تلاش‌های شما زیاد است. کمی صبر کنید" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login",    authLimiter, validate(loginSchema),    login);
router.get( "/me",       requireUserAuth, me);

export default router;