import * as ordersService from "../services/orders.service.js";

export async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.currentUser.id, req.body);
    res.status(201).json({ success: true, message: "سفارش شما با موفقیت ثبت شد", order });
  } catch (err) { next(err); }
}

export async function getOrder(req, res, next) {
  try {
    const order = await ordersService.getOrderForUser(req.currentUser.id, req.params.id);
    res.json({ success: true, order });
  } catch (err) { next(err); }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await ordersService.getOrdersForUser(req.currentUser.id);
    res.json({ success: true, orders });
  } catch (err) { next(err); }
}

export async function getAllOrders(req, res, next) {
  try {
    const query = {
      status: req.query.status || undefined,
      page:   req.query.page  ? parseInt(req.query.page)  : 1,
      limit:  req.query.limit ? parseInt(req.query.limit) : 20,
    };
    const result = await ordersService.getAllOrdersAdmin(query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function updateStatus(req, res, next) {
  try {
    const order = await ordersService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ success: true, message: "وضعیت سفارش به‌روزرسانی شد", order });
  } catch (err) { next(err); }
}