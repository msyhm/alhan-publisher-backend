import { Router } from "express";
import { requireUserAuth, validate } from "../middlewares/authMiddleware.js";
import { createOrderSchema } from "../validators/order.validator.js";
import { createOrder, getOrder, getMyOrders } from "../controllers/orders.controller.js";

const router = Router();
router.use(requireUserAuth);

router.post("/",   validate(createOrderSchema), createOrder);
router.get( "/",    getMyOrders);
router.get( "/:id", getOrder);

export default router;