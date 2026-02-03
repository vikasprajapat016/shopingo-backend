import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
  email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
}
,
    password: {
        type: String,
        required: true
    },
    profilepic: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
    },
    role: {
    type: String,
    enum: [
      "SUPER_ADMIN",
      "USER_ADMIN",
      "PRODUCT_ADMIN",
      "ORDER_ADMIN",
      "USER"
    ],
    default: "USER"},
    blocked: {
        type: Boolean,
        default: false,
    }

},{timestamps: true})


export default mongoose.model("User", userSchema, "users");

