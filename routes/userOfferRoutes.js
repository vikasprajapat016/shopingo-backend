import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import {  getApplicableOffers, getOfferProducts, topDeals,  } from "../controller/userOffers.js";
import { getOfferById } from "../controller/offerControl.js";

const router = express.Router();

router.get("/offers",authMiddleware, getApplicableOffers);


router.get("/get/offer/:id",authMiddleware, getOfferById)

router.get("/offers/category/:id",authMiddleware, getOfferProducts)

router.post("/applicable", getApplicableOffers);
router.get("/top/deals",authMiddleware, topDeals)



export default router;
