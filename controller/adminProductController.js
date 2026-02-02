import Products from "../models/productModel.js"
import path from "path"
import fs from "fs";
import { nanoid } from 'nanoid';

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalProducts = await Products.countDocuments();

    const products = await Products.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      

    res.status(200).json({
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Some error while fetching products",
      error: error.message,
    });
  }
};


export const createProduct = async (req, res) => {
    try {
        const {  title,
      price,
      stock,
      category,
      brand,
      description,
      warrantyInformation,
      returnPolicy,
      
      
      } = req.body;
      
        const thumbnail = req.file
      ? `uploads/products/${req.file.filename}`
      : null;



      const adminId = req.user._id;

    if (price == null || !title || !category || !thumbnail || !brand ) {
        return res.status(400).json({
            message: "Missing required fields"
        })
    }

    if (price <= 0 || stock < 0) {
        return res.status(400).json({
            message: "price or stock must be positive"
        })
    }

    const product = await Products.create({
            id: nanoid(),  // unique id

        title,
        price,
        stock,
        category,
        thumbnail,
        brand,
        description,
        warrantyInformation,
        returnPolicy,
        
        adminId,
    })

    res.status(200).json({
        message:"Product created",
        product,
    })
    } catch (error) {
        res.status(400).json({
            message: "Failed to create Product",
        error: error.message
        })
    }
}





export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {stock, price} = req.body

    if (price <= 0 || stock < 0) {
        return res.status(400).json({
            message: "price or stock must be positive"
        })
    }


    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // if new image uploaded → delete old one
    if (req.file && product.thumbnail) {
      const oldPath = path.join(process.cwd(), product.thumbnail);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const updatedData = { ...req.body };

    if (req.file) {
      updatedData.thumbnail = `uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};


export const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params

        const product = await Products.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            })
        }

        if (product.thumbnail && !product.thumbnail.startsWith("http")) {
  const filePath = path.join(process.cwd(), product.thumbnail);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // delete file only
  }
}


        await product.deleteOne();

        res.status(200).json({
            message: "Product deleted",
            product,
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete the product "
        })
    }
}


// GET /admin/products/:id
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};



//update stocks

export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock < 0) {
    return res.status(400).json({ message: "Stock cannot be negative" });
  }


  const product = await Products.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true }
  );

  res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({
      error: error.messsage
    })
  }
};



// low products 

export const InventroyProducts = async (req, res) => {
  try {
      const low = 50
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
const totalProducts = await Products.countDocuments({
  stock: { $lte: low }
});

    const products = await Products.find( { stock : { $lte : low}})
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ stock: 1})
          .select("title thumbnail stock price")
          .lean()


          res.status(200).json({
            products,
            pagination: {
              totalProducts,
              totalPages: Math.ceil(totalProducts / limit),
              currentPage: page
            }
          })
  } catch (error) {
          res.status(500).json({
            error: error.message
          })
  }
}


// debounced products 




export const getFilteredProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim();

    const query = search
      ? { $text: { $search: search } }
      : {};

    const totalProducts = await Products.countDocuments(query);

    const products = await Products.find(query)
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title price stock category thumbnail");

    res.status(200).json({
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};
