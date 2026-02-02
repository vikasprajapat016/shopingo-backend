import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { authorize } from "../middlewares/authorize.js";
import { uploadSingleImage } from "../middlewares/uploadProductImage.js";

import { createProduct, deleteProduct, getAllProducts, getFilteredProducts, getSingleProduct, InventroyProducts, updateProduct, updateProductStock } from "../controller/adminProductController.js";
const router = express.Router();

router.get(
  "/products",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  getAllProducts
);


router.get("/low-products", authMiddleware,
  InventroyProducts
)

router.get("/get/filtered/products", authMiddleware, 
  getFilteredProducts
)

router.get(
  "/products/:id",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  getSingleProduct
);

router.post(
  "/product/create",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  uploadSingleImage,
  createProduct
);

router.patch("/update/product/stock/:id",authMiddleware,
    authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
    updateProductStock

)

router.put(
  "/product/:id",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  uploadSingleImage,
  updateProduct
);

router.delete(
  "/product/:id",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  deleteProduct
);

export default router;
