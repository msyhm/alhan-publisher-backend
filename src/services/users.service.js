import { prisma } from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateUserToken } from "../utils/jwt.js";

export async function registerUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("این ایمیل قبلاً ثبت‌نام کرده است", 409);

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, phone: data.phone || null, passwordHash },
  });

  const token = generateUserToken(user);
  return { user, token };
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("ایمیل یا رمز عبور اشتباه است", 401);

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new AppError("ایمیل یا رمز عبور اشتباه است", 401);

  const token = generateUserToken(user);
  return { user, token };
}