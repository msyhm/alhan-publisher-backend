import { prisma }   from "../config/database.js";
import { AppError } from "../middlewares/errorHandler.js";

async function getShippingCost() {
  const row = await prisma.siteSetting.findUnique({ where: { key: "shipping" } });
  const cost = row?.value?.shippingCost;
  return typeof cost === "number" ? cost : 0;
}

export async function createOrder(userId, data) {
  const bookIds = data.items.map((i) => i.bookId);
  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } });

  if (books.length !== bookIds.length) {
    throw new AppError("برخی از کتاب‌های سبد خرید دیگر موجود نیستند", 400);
  }

  let subtotal = 0;
  const orderItemsData = data.items.map((item) => {
    const book = books.find((b) => b.id === item.bookId);
    const price = book.price ? Number(book.price) : 0;
    subtotal += price * item.quantity;
    return { bookId: book.id, title: book.title, price, quantity: item.quantity };
  });

  const shippingCost = await getShippingCost();
  const total = subtotal + shippingCost;

  const address = await prisma.address.create({
    data: {
      userId,
      fullName: data.fullName, phone: data.phone, province: data.province,
      city: data.city, postalCode: data.postalCode, addressLine: data.addressLine,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId, addressId: address.id, subtotal, shippingCost, total,
      status: "PENDING_PAYMENT",
      items: { create: orderItemsData },
    },
    include: { items: true, address: true },
  });

  return order;
}

export async function getOrderForUser(userId, orderId) {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId) },
    include: { items: true, address: true },
  });
  if (!order || order.userId !== userId) throw new AppError("سفارش پیدا نشد", 404);
  return order;
}

export async function getOrdersForUser(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true, address: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrdersAdmin(query) {
  const page  = query.page  || 1;
  const limit = query.limit || 20;
  const where = query.status ? { status: query.status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items:   true,
        address: true,
        user:    { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateOrderStatus(orderId, status) {
  const existing = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
  if (!existing) throw new AppError("سفارش پیدا نشد", 404);

  return prisma.order.update({ where: { id: parseInt(orderId) }, data: { status } });
}