import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { authorize } from "../middlewares/authorize.js";
import { uploadOfferBanner } from "../middlewares/uploadOfferImage.js";
import { createOffer, deleteOffer, getActiveOffers, getOfferById, toggleOfferStatus } from "../controller/offerControl.js";
import { getOfferProducts } from "../controller/userOffers.js";

const router = express.Router();

router.post(
  "/create/offers",
  authMiddleware,
  authorize("SUPER_ADMIN","PRODUCT_ADMIN","USER_ADMIN","ORDER_ADMIN"),
  uploadOfferBanner.single("bannerImage"),
  createOffer
);


router.get("/offers", getActiveOffers);


router.get("/get/offer/:id", getOfferById)

router.get("/offers/category/:id/products", getOfferProducts)



router.patch("/offers/toggle/:id",
  authMiddleware,
  authorize("SUPER_ADMIN","PRODUCT_ADMIN","USER_ADMIN","ORDER_ADMIN"),
  toggleOfferStatus);


router.delete("/offers/delete/:id",
  authMiddleware,
  authorize("SUPER_ADMIN","PRODUCT_ADMIN","USER_ADMIN","ORDER_ADMIN"),
  deleteOffer);

export default router;
