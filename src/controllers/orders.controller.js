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