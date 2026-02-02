import express from "express";
import { replaceProductImages, saveProduct, updateProductImages } from "../controller/file.js";

const router = express.Router()

router.post("/save/download/update/db" , saveProduct);
//router.post("/save" , saveProduct);


export default router;