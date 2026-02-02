import Cart from "../models/cartModel.js";
import mongoose from "mongoose";

// GET cart
export const getCart = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, products: [] });
  }

  res.json(cart);
};

// ADD or UPDATE product
export const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { product } = req.body; // productId, title, price, image, quantity

  if (!userId || !product) return res.status(400).json({ message: "Missing data" });

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, products: [] });
  }

  const exists = cart.products.find(p => p.productId.toString() === product.productId);
  if (exists) {
    exists.quantity += product.quantity;
  } else {
    cart.products.push(product);
  }

  await cart.save();
  res.json(cart);
};

// REMOVE product
// DELETE /cart/:userId/:productId
export const removeFromCart = async (req, res) => {

  console.log("in remove")
  console.log("in remove ")
  const { userId, productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) 
    return res.status(400).json({ message: "Invalid userId" });

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    res.status(200).json({ success: true, products: cart.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove item" });
  }
};


// CLEAR cart
export const clearCart = async (req, res) => {
  const { userId } = req.params;

  console.log("in clear")

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = [];
    await cart.save();
    res.status(200).json({ success: true, products: [] });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};



// update cart

export const updateQuantity = async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const product = cart.products.find(
    p => p.productId.toString() === productId
  );

  if (!product) {
    return res.status(404).json({ message: "Product not in cart" });
  }

  product.quantity = quantity;
  await cart.save();

  res.json(cart);
};
