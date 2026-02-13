import Order from "../models/orderModel.js";
import Products from "../models/productModel.js";
import Offer from "../models/offere.js";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto";

/* ------------------------------
   COMMON CALCULATION FUNCTION
--------------------------------*/
const calculateOrderData = async (items, offerId) => {
  // console.log("ITEMS:", items);

const productIds = items.map(i => i.product.toString());

const products = await Products.find({
  _id: { $in: productIds }
});

if (products.length !== items.length) {
  throw new Error("One or more products not found");
}
const productMap = new Map(products.map(p => [p._id.toString(), p]));
// console.log("PRODUCT MAP:", productMap);

  // stock check
  for (let item of items) {
    const product = productMap.get(item.product.toString());
   
    
    if (!product) {
  throw new Error("Product not found");
}

if (product.stock < item.quantity) {
  throw new Error(`${product.title} out of stock`);
}


  }

  // base total
  let totalAmount = 0;
  for (let item of items) {
    const p = productMap.get(item.product.toString());
    totalAmount += p.price * item.quantity;
  }

  // offer logic
  let discount = 0;
  if (offerId) {
    const offer = await Offer.findById(offerId);
    if (offer?.isActive) {
      let eligible = 0;
      for (let item of items) {
        const p = productMap.get(item.product.toString());
      const categories = offer.categories || [];

if (
  categories.length === 0 ||
  categories.map(c => c.toString()).includes(p.category.toString())
) {
          eligible += p.price * item.quantity;
        }
      }

      discount =
        offer.discountType === "percentage"
          ? (eligible * offer.discountValue) / 100
          : Math.min(offer.discountValue, eligible);
    }
  }

totalAmount = Math.max(1, totalAmount);

  return { productMap, totalAmount };
};

/* ------------------------------
   CREATE ORDER (COD / ONLINE)
--------------------------------*/
export const createOrder = async (req, res) => {
  try {
    // console.log("BODY:", req.body);

    const { items, offerId, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!items || !items.length)
      return res.status(400).json({ message: "Cart empty" });

    const { productMap, totalAmount } =
      await calculateOrderData(items, offerId);

    /* ---------- COD ---------- */
    if (paymentMethod === "COD") {
      const order = await Order.create({
        user: userId,
        items: items.map(i => {
          const p = productMap.get(i.product.toString());
          return {
            product: p._id,
            title: p.title,
            price: p.price,
            quantity: i.quantity,
            thumbnail: p.thumbnail,
          };
        }),
        totalAmount,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        offer: offerId || null,
      });

      // reduce stock
      for (let i of items) {
        await Products.findByIdAndUpdate(i.product, {
          $inc: { stock: -i.quantity },
        });
      }

      return res.status(201).json({ message: "COD order placed", order });
    }

    /* ---------- ONLINE ---------- */

        if (!razorpay) {
  return res.status(503).json({ message: "Online payment not available" });
}



    const razorOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return res.status(200).json({
      razorOrder,
      totalAmount,
    });

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

/* ------------------------------
   VERIFY ONLINE PAYMENT
--------------------------------*/
export const verifyOnlinePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      offerId,
          } = req.body;

    const userId = req.user._id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: "Payment verification failed" });

const { productMap, totalAmount } =
  await calculateOrderData(items, offerId);

    const order = await Order.create({
      user: userId,
      items: items.map(i => {
        const p = productMap.get(i.product.toString());
        return {
          product: p._id,
          title: p.title,
          price: p.price,
          quantity: i.quantity,
          thumbnail: p.thumbnail,
        };
      }),
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      offer: offerId || null,
    });

    // reduce stock AFTER payment
    for (let i of items) {
      await Products.findByIdAndUpdate(i.product, {
        $inc: { stock: -i.quantity },
      });
    }

    res.json({ message: "Payment successful", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
