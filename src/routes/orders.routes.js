import { Router } from "express";
import { requireAuth, requireUserAuth, validate } from "../middlewares/authMiddleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.validator.js";
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateStatus,
} from "../controllers/orders.controller.js";

const router = Router();

router.post("/",    requireUserAuth, validate(createOrderSchema), createOrder);
router.get( "/",     requireUserAuth, getMyOrders);
router.get( "/:id",  requireUserAuth, getOrder);

router.get(   "/admin/all",        requireAuth, getAllOrders);
router.patch( "/admin/:id/status", requireAuth, validate(updateOrderStatusSchema), updateStatus);

export default router;