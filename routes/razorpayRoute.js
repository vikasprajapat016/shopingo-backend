import express from "express"
import authMiddleware from "../middlewares/authMiddlewares.js"
import { createOrder, verifyOnlinePayment } from "../controller/razorController.js"

const router = express.Router()


router.post("/create/cod-order",authMiddleware, createOrder)

router.post("/create/online/order", authMiddleware, createOrder);

router.post("/verify/order",authMiddleware, verifyOnlinePayment)

export default router