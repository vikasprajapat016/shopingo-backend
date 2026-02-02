import mongoose from "mongoose";


const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },

    discountValue: { type: Number, required: true },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    minCartValue: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    bannerImage: { type: String, required: true },

    startDate: Date,

    expiryDate: Date,

  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
