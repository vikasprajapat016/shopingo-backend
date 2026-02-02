import express from "express";
import {
  createSlider,
  getAllSliders,
  getActiveSliders,
  getSliderById,
  updateSlider,
  deleteSlider,
} from "../controller/sliderController.js";

import upload from "../middlewares/UploadSlider.js";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();

/* ADMIN */
router.post(
  "/create/slider",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  upload("sliders").single("image"),
  createSlider
);

router.get(
  "/sliders",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  getAllSliders
);

router.get(
  "/sliders/:id",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  getSliderById
);

router.put(
  "/slider/update/:id",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  upload("sliders").single("image"),
  updateSlider
);

router.delete(
  "/slider/delete/:id",
  authMiddleware,
  authorize("SUPER_ADMIN", "PRODUCT_ADMIN"),
  deleteSlider
);

/* PUBLIC */
router.get("/active/sliders", getActiveSliders);

export default router;
