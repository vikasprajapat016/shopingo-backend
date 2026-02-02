import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { authorize } from "../middlewares/authorize.js";
import {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  getCategoryById,
  getProductsByCategory,
} from "../controller/categoryController.js";
import { categoryUpload } from "../middlewares/uploadCategoryImage.js";
import mongoose from "mongoose";


const router = express.Router();

router.post(
  "/create/category",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  categoryUpload.single("image"),
  createCategory
);

router.put(
  "/update/:id",
  categoryUpload.single("image"),
  updateCategory
);


router.get("/category", getCategories);

router.get("/category/:id",getCategoryById);

router.get("/products/category/:categoryId", getProductsByCategory)

router.delete(
  "/delete/:id",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  deleteCategory
);

export default router;
