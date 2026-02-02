import Offer from "../models/offere.js";
import Product from "../models/productModel.js";


// user frontend offers api 

// export const getApplicableOffers = async (req, res) => {
//   try {

//       console.log("in offers applicable")


//     const { cartTotal, categoryIds } = req.body;
//     const now = new Date();
//     const offers = await Offer.find({
//       isActive: true,
//       startDate: { $lte: now },
//       expiryDate: { $gte: now },
//       minCartValue: { $lte: cartTotal },
//       $or: [
//         { categories: { $size: 0 } }, // global offer
//         { categories: { $in: categoryIds } }
//       ]
//     });

//     res.json({ offers });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch applicable offers" });
//   }
// };




export const getOfferProducts = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Find products belonging to offer categories
    const products = await Product.find({
      category: { $in: offer.categories },
    });

    res.status(200).json({
      offer,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offer products" });
  }
};


// controllers/offerController.js

// Get applicable offers based on cart productIds
export const getApplicableOffers = async (req, res) => {
  try {
    const { categoryIds, cartTotal } = req.body;

    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
      minCartValue: { $lte: cartTotal },
      $or: [
        { categories: { $size: 0 } }, // global offers
        { categories: { $in: categoryIds } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch applicable offers" });
  }
};






// Get active offers sorted by highest discount first
export const topDeals = async (req, res) => {
  try {
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
    })
      .populate("categories") // fetch category details
      .sort({ discountValue: -1 }) // highest discount first
      .lean();

    res.status(200).json({ offers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
}



