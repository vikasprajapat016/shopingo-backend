import Products from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";

export const getAdminStats = async (req, res) => {
  try {

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )
    const [users, products, categories,orders, monthlyUsers, monthlyProducts, monthlyOrders] = await Promise.all([
      User.countDocuments(),
      Products.countDocuments(),
      Products.distinct("category"),
      Order.countDocuments(),
      User.countDocuments({ createdAt : { $gte: startOfMonth}}),
      Products.countDocuments({ createdAt : { $gte: startOfMonth}}),
      Order.countDocuments({ createdAt : { $gte: startOfMonth}})
      
    ]);
    //  console.log(users, products, category)
    res.status(200).json({
      users,
      products,
      orders,
      categories: categories.length,
      monthlyUsers,
      monthlyProducts,
      monthlyOrders
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};



export const getRecentData = async (req, res) => {
  try {
    const recentUsers = await User.find()
    .sort({ createdAt: -1})
    .limit(5)
    .select("email createdAt ")
    .lean()
    ;


    const recentProducts = await Products.find()
    .sort({ createdAt: -1})
    .limit(5)
    .select("title createdAt thumbnail price stock ")
    .lean();
  

     const LOW_STOCK_LIMIT = 5;

    const lowStockProducts = await Products.find({
      stock: { $lte: LOW_STOCK_LIMIT },
    })
      .sort({ stock: 1 }) 
      .limit(10)
      .select("title thumbnail stock price")
      .lean();

    res.status(200).json({
      recentUsers,
      recentProducts,
      lowStockProducts,
    })
  } catch (error) {
    res.status(500).json({ message: "Error while fetching recent data"})
  }
}


export const getAllUsers = async (req, res) => {
try {
    const users =  await User.find().select("-password ").sort({createdAt: -1});
    res.status(200).json({
      success: true,
      users,
    })
} catch (error) {
  res.status(500).json({
    success: false,
    error,
  })
}  
}


export const toggleBlockUser = async (req,res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });}

    

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(300).json( {
        message: "Pagal h kya khud ko hi block krega? "
      })
    }

    if (user.role === "SUPER_ADMIN") {
      return res.status(300).json({
        message: "Super admin ko block krega tu , itni himmat"
      });
    }

  user.blocked = !user.blocked;
 await user.save();  
  res.status(200).json({
    message: user.blocked? "User blocked" :"User unblocked"
  })
  
}








export const getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 6);

    // Users grouped by day
    const users = await User.aggregate([
      {
        $match: { createdAt: { $gte: last7Days } },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Orders grouped by day
    const orders = await Order.aggregate([
      {
        $match: { createdAt: { $gte: last7Days } },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Day mapping
    const daysMap = {
      1: "Sun",
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat",
    };

    const stats = Object.values(daysMap).map((day) => ({
      day,
      users: users.find((u) => daysMap[u._id] === day)?.count || 0,
      orders: orders.find((o) => daysMap[o._id] === day)?.count || 0,
    }));

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};





export const getLast7DaysOrders = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1 (Sun) → 7 (Sat)
          orders: { $sum: 1 },
        },
      },
    ]);

    const daysMap = {
      1: "Sun",
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat",
    };

    const formatted = Object.values(daysMap).map((day, index) => {
      const found = orders.find(o => o._id === index + 1);
      return {
        day,
        orders: found ? found.orders : 0,
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch orders stats",
      error: error.message,
    });
  }
};