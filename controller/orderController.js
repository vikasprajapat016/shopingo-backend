import Order from "../models/orderModel.js";
import Products from "../models/productModel.js";
import Offer from "../models/offere.js"; // import your Offer model

// ------------------------
// Admin: Get All Orders
// ------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
      
      const totalOrders = await Order.countDocuments();
    res.status(200).json({ orders, totalOrders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ------------------------
// Admin/User: Get Single Order
// ------------------------
export const getSingleOrder = async (req,res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email"); // remove items.product populate if product is just a string

    if(!order) return res.status(404).json({message:"Order not found"});
    res.status(200).json({order});
  } catch(error) {
    res.status(500).json({message:"Failed to fetch order", error:error.message});
  }
}

// ------------------------
// Create Order (with offer)
// ------------------------



export const createOrder = async (req, res) => {
  try {
    const {items, offerId, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Fetch original products
    const productIds = items.map(i => i.product);
    const products = await Products.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Stock validation
    for (let item of items) {
      const product = productMap.get(item.product.toString());
      if (!product || product.stock < item.quantity)
        return res.status(400).json({ message: `${item.title} is out of stock` });
    }

    // Fetch offer if provided
    let discount = 0;
    let offer = null;
    if (offerId) {
      offer = await Offer.findById(offerId);
      if (offer && offer.isActive) {
        // Calculate eligible amount
        let eligibleAmount = 0;
        for (let item of items) {
          const product = productMap.get(item.product.toString());
          if (
            !offer.categories.length || // global offer
            offer.categories.map(c => c.toString()).includes(product.category.toString())
          ) {
            eligibleAmount += product.price * item.quantity;
          }
        }

        // Apply discount
        if (offer.discountType === "percentage") discount = (eligibleAmount * offer.discountValue) / 100;
        else discount = Math.min(offer.discountValue, eligibleAmount);
      }
    }

    // Calculate totalAmount
    let totalAmount = items.reduce((acc, item) => {
      const product = productMap.get(item.product.toString());
      return acc + product.price * item.quantity;
    }, 0);
    totalAmount -= discount;

    if (paymentMethod === "COD") {
       const order = await Order.create({
      user: userId,
      items: items.map(item => {
        const p = productMap.get(item.product.toString());
        return {
          product: p._id,
          title: p.title,
          price: p.price,
          quantity: item.quantity,
          thumbnail: p.thumbnail,
        };
      }),
      totalAmount,
      offer: offerId || null,
    });

        res.status(201).json({ message: "Order placed successfully", order });

    } 
    else if(paymentMethod === "ONLINE") {
      const {razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature 
      } = req.body


      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
      .createHmac("sha256" ,process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex")


      if (expectedSignature != razorpay_signature) {
        res.status(400).json({
          message: "payment verification failed"
        })
      }

         const order = await Order.create({
      user: userId,
      items: items.map(item => {
        const p = productMap.get(item.product.toString());
        return {
          product: p._id,
          title: p.title,
          price: p.price,
          quantity: item.quantity,
          thumbnail: p.thumbnail,
        };
      }),
      paymentMethod,
      totalAmount,
      offer: offerId || null,
    });

    
          res.status(201).json({ message: "Order placed successfully", order });


    }

   

    // Reduce stock
    for (let item of items) {
      const product = productMap.get(item.product.toString());
      await Products.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};






// ------------------------
// Get Orders of Logged-in User
// ------------------------
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};


// ------------------------
// Cancel Order
// ------------------------
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (order.orderStatus !== "PENDING")
      return res.status(400).json({ message: "Order cannot be cancelled" });

    order.orderStatus = "CANCELLED";
    await order.save();

    res.json({ message: "Order cancelled" });
  } catch {
    res.status(500).json({ message: "Cancel failed" });
  }
};

// ------------------------
// Admin: Update Order Status
// ------------------------
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    if (status === "DELIVERED") order.deliveredAt = new Date();

    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" });
  }
};








