import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    link: {
      type: String, // product / category / external link
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    position: {
      type: Number, // order of slider
      default: 0,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Slider", sliderSchema);
