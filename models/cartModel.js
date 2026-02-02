import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      title: String,
      price: Number,
      image: String,
      stock: Number,
      quantity: { type: Number, default: 1 },
          category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // new field

    },
  ],
}, { timestamps: true });

export default mongoose.model("Cart", CartSchema);
