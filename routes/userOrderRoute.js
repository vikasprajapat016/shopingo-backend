// routes/orderRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { cancelOrder, createOrder, getMyOrders } from "../controller/orderController.js";

const router = express.Router();

router.post(
  "/orders/create",
  authMiddleware,
  createOrder
);

router.get(
  "/orders/my",
  authMiddleware,
  getMyOrders
);

router.patch(
  "/orders/cancel/:id",
  authMiddleware,
  cancelOrder
);


export default router;
