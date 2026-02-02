import express from  "express"
import {getAllProduct, getProductById, getProduct, topProducts} from "../controller/userProductController.js"
import authMiddleware from "../middlewares/authMiddlewares.js";
import { getAllProducts } from "../controller/adminProductController.js";

const router = express.Router();

router.get("/get", getProduct);
router.get("/top-product",topProducts)
router.get("/product/pagination", authMiddleware, getAllProducts);
router.get("/", authMiddleware, getAllProduct);
router.get("/:id", authMiddleware, getProductById);

export default router;
