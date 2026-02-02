import fs from "fs"
import path from "path"
import axios from "axios"
import Stream from "stream";
import { pipeline } from "stream/promises";
import Products from "../models/productModel.js";



/**
 * Converts any string into a URL-safe folder name
 */
export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
};

/**
 * Downloads an image and saves it under uploads/products/<safeFolder>/
 * Returns relative path to store in MongoDB
 */
export const downloadImages = async (url, safeFolder) => {
  const ext =
    path.extname(new URL(url).pathname) || ".jpg";

  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}${ext}`;

  const dir = path.join(
    process.cwd(),
    "uploads",
    "products",
    safeFolder
  );

  // ✅ Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, filename);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 15000,
  });

  await pipeline(response.data, fs.createWriteStream(filePath));

  // ✅ Prevent empty/corrupt files
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    fs.unlinkSync(filePath);
    throw new Error("Downloaded image is empty");
  }

  // ✅ Return relative web path
  return `uploads/products/${safeFolder}/${filename}`;
};




/**
 * Update ONLY images & thumbnail for existing products
 */
export const updateProductImages = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://dummyjson.com/products?limit=194"
    );

    let updatedCount = 0;

    for (const item of data.products) {
      const product = await Products.findOne({ id: item.id });

      if (!product) continue; // skip if product not found

      const safeFolder = slugify(product.title);

      // 🔹 Download images
      const images = [];
      for (const img of item.images) {
        const localPath = await downloadImages(img, safeFolder);
        images.push(localPath);
      }

      // 🔹 Download thumbnail
      const thumbnail = await downloadImages(
        item.thumbnail,
        safeFolder
      );

      // ✅ ONLY update these fields
      product.images = images;
      product.thumbnail = thumbnail;
      product.updatedAt = new Date();

      await product.save();
      updatedCount++;
    }

    res.status(200).json({
      message: "Product images updated successfully",
      updated: updatedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update product images",
      error: error.message,
    });
  }
};


const deleteFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export const replaceProductImages = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://dummyjson.com/products?limit=194"
    );

    let replaced = 0;

    for (const item of data.products) {
      const product = await Products.findOne({ id: item.id });
      if (!product) continue;

      const safeFolder = slugify(product.title);

      // 🔥 1. DELETE OLD FILES
      product.images?.forEach(deleteFile);
      deleteFile(product.thumbnail);

      // 🔥 2. CLEAR DB FIELDS
      product.images = [];
      product.thumbnail = "";

      // 🔥 3. DOWNLOAD NEW IMAGES (UNIQUE ONLY)
      const uniqueImages = [...new Set(item.images)];

      const images = [];
      for (const img of uniqueImages) {
        images.push(await downloadImages(img, safeFolder));
      }

      const thumbnail = await downloadImages(
        item.thumbnail,
        safeFolder
      );

      // 🔥 4. SAVE ONLY NEW PATHS
      product.images = images;
      product.thumbnail = thumbnail;
      product.updatedAt = new Date();

      await product.save();
      replaced++;
    }

    res.status(200).json({
      message: "Product images replaced successfully",
      replaced,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to replace product images",
      error: error.message,
    });
  }
};




















export const downloadImage = async (url, folder) => {
  const ext = path.extname(new URL(url).pathname) || ".jpg";

  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}${ext}`;

    const dir = path.join("uploads", "products", folder);

        if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, filename);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return filePath.replace(/\\/g, "/");
};




export const saveProduct = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://dummyjson.com/products?limit=194"
    );

    for (const item of data.products) {
      const folderName = slugify(item.title);


      const images = [];
      for (const img of item.images) {
        const localPath = await downloadImage(img, folderName);
        images.push(localPath);
      }

      const thumbnailPath = await downloadImage(
        item.thumbnail,
        folderName
      );

await Products.updateOne(
  { id: item.id },   // ✅ CORRECT
  {
    $set: {
      thumbnail: thumbnailPath,
      images,
      updatedAt: new Date(),
    },
  }
);


    }

    res.status(201).json({
      message: "Products seeded successfully",
      count: data.products.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
