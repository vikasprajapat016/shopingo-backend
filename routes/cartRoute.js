import express from "express";
import { getCart, addToCart, removeFromCart, clearCart, updateQuantity } from "../controller/cartContoller.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/add/:userId", addToCart);
router.delete("/clear/:userId", clearCart);

router.delete("/:userId/:productId", removeFromCart);
router.patch("/quantity/:userId/:productId", updateQuantity);

export default router;
