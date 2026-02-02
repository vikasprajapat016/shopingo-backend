import Category from "../models/categoryModel.js";
import slugify from "slugify";
import Products from "../models/productModel.js"
import mongoose from "mongoose";
  


// CREATE
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

       const image = req.file
      ? `uploads/category/${req.file.filename}`
      : null;


    if (!name || !req.file) {
      return res.status(400).json({ message: "Category name and image required" });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      slug: slugify(name),
      image: image,
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ message: "Failed to create category" });
  }
};


export const updateCategory = async (req, res) => {
  const { id } = req.params;
  console.log("in update category")

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const updateData = {
    name: req.body.name ?? category.name,
    slug: req.body.name ? slugify(req.body.name) : category.slug,
  };

  if (req.file) {
    updateData.image = `uploads/category/${id}/${req.file.filename}`;
  }

  const updated = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, category: updated });
};




// GET ALL
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ success: true, categories });
};


export const getCategoryById = async (req, res) => {
  try {
    console.log("in getCategoryById");

    const { id } = req.params; // ✅ FIX HERE

    if (!id) {
      return res.status(400).json({
        message: "Invalid category id",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load category by id",
      error: error.message,
    });
  }
};





// DELETE
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
};



//Get category products




// GET PRODUCTS BY CATEGORY

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const products = await Products.find({
      category: new mongoose.Types.ObjectId(categoryId),
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};
