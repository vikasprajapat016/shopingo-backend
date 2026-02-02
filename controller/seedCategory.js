import mongoose from "mongoose";
import Product from "../models/productModel.js"
import Category from "../models/categoryModel.js";

const categories = [
  "beauty", "fragrances", "furniture", "groceries",
  "home-decoration", "kitchen-accessories",
  "laptops", "mens-shirts", "mens-shoes",
  "mens-watches", "mobile-accessories",
  "motorcycle", "skin-care", "smartphones",
  "sports-accessories", "sunglasses",
  "tablets", "tops", "vehicle",
  "womens-bags", "womens-dresses",
  "womens-jewellery", "womens-shoes",
  "womens-watches"
];


export const seed = async (req, res) => {
  try {
    let inserted = 0;

    for (const c of categories) {
      const result = await Category.updateOne(
        { name: c },                     // check if exists
        { $setOnInsert: { name: c, slug: c } },
        { upsert: true }
      );

      if (result.upsertedCount > 0) inserted++;
    }

    res.status(200).json({
      message: "Categories seeded successfully",
      inserted
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Seeding failed" });
  }
};









export const migrateProductCategories = async (req, res) => {
  try {
    // 1️⃣ Load categories
    const categories = await Category.find();

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    let updated = 0;

    // 2️⃣ Use lean() to avoid schema casting
    const products = await Product.find().lean();

    for (const prod of products) {
      if (typeof prod.category !== "string") continue;

      const categoryId = categoryMap[prod.category];

      if (categoryId) {
        await Product.updateOne(
          { _id: prod._id },
          { category: categoryId }
        );
        updated++;
      }
    }

    res.json({
      message: "Products updated successfully",
      updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Migration failed" });
  }
};








export const migrateCategoryIds = async () => {
  const products = await Product.find();

  for (const p of products) {
    if (typeof p.category === "string") {
      p.category = new mongoose.Types.ObjectId(p.category);
      await p.save();
    }
  }

  console.log("✅ Product categories fixed");
};
