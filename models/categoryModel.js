import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    image: {
      type: String,
      default: null,

    }
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
