import Offer from "../models/offere.js";
import Product from "../models/productModel.js";


//auto disable expired offer
export const autoDisableExpiredOffers = async () => {
  const now = new Date();

  await Offer.updateMany(
    {
      expiryDate: { $lt: now },
      isActive: true,
    },
    {
      $set: { isActive: false },
    }
  );
};





//create offer

export const createOffer = async (req, res) => {
  try {
    const {
      title,
      discountType,
      discountValue,
      categories,
      minCartValue,
      startDate,
      expiryDate,
      isActive,
    } = req.body;
    console.log(req.body)

    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    if (!title || !discountType || !discountValue || !startDate || !expiryDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (startDate >= expiryDate) {
      return res.status(400).json({ message: "Start date must be greater than expiry date"})
    }

    // categories comes as string or array (FormData issue handled)
    const categoryIds = Array.isArray(categories)
      ? categories
      : [categories];

    const offer = await Offer.create({
      title,
      discountType,
      discountValue,
      categories: categoryIds,
      minCartValue,
      startDate,
      expiryDate,
      isActive,
      bannerImage: `/uploads/offers/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create offer",
    });
  }
};





//get offers


export const getActiveOffers = async (req, res) => {
  try {


    await autoDisableExpiredOffers()
    const now = new Date();

const [availableOffers, expiredOffers, deactiveOffers , upcomingOffers] = await Promise.all([
  Offer.find({
    isActive: true,
    startDate: { $lte: now },
    expiryDate: { $gte: now }
  }).populate("categories", "name slug"),

  Offer.find({
    expiryDate: { $lt: now }
  }).populate("categories", "name slug"),

  Offer.find({
    isActive:false,
    expiryDate: { $gte: now}
  }).populate("categories", "name"),

  Offer.find({
    startDate: { $gte: now}
  })
]);



  res.json({
      availableOffers,
      expiredOffers,
      deactiveOffers,
      upcomingOffers
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch offers" });
  }
};



// get offerById 

export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("categories", "name slug");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.json({ offer });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch offer" });
  }
};




// toggle offers active->deactive
export const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // ❌ Cannot activate expired offer
    if (offer.expiryDate < new Date()) {
      offer.isActive = false;
      await offer.save();
      return res.status(400).json({
        message: "Expired offer cannot be activated",
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      message: `Offer ${offer.isActive ? "activated" : "deactivated"}`,
      offer,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle offer" });
  }
};




//delete offer

export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete offer" });
  }
};





