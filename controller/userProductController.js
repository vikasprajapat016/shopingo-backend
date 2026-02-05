import Product from "../models/productModel.js";

export const  getAllProduct = async (req, res) => {

    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch Products"
        })
    }

}

export const getProductById = async (req, res) => {
  const id = Number(req.params.id);
  console.log("in getproduct by id")

  try {
    const product = await Product.findById(req.params.id)
    .populate("category", "name")


    console.log(product.category.name)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
   
    res.status(200).json({
      success: true,
      product,
      
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get Product",
    });
  }
};




export const getProduct = async (req, res) => {
  try {
    console.log("in getproduct")
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const category = req.query.category;

    const filter = {};
    if (category) filter.category = category;

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const topProducts =  async(req, res) => {
  try {
    console.log("in topproduct")
    const products = await Product.find({rating: { $gte: 4.9}}).limit(8)
    
    res.status(200).json({
      products,
      message: "Products found"
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}