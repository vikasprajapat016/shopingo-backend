import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { authorize } from "../middlewares/authorize.js";
import {
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
} from "../controller/orderController.js";

const router = express.Router();

router.get(
  "/orders",
  authMiddleware,
  authorize("SUPER_ADMIN", "ORDER_ADMIN"),
  getAllOrders
);

router.get("/orders/:id", authMiddleware, authorize("SUPER_ADMIN","ORDER_ADMIN"), getSingleOrder);


router.put(
  "/orders/:id/status",
  authMiddleware,
  authorize("SUPER_ADMIN", "ORDER_ADMIN"),
  updateOrderStatus
);

export default router;
