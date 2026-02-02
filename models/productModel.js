import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
    id: {
    type: String,
    unique: true
},

    adminId: {
        type:String
    },
    title: {
        type: String,
        required: true,

    },
    description: {
        type: String,

    },
   category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  required: true,
},
    price: {
        type: Number,
        required: true
    },
    discountPercent: Number,
    rating: Number,
    stock: Number,
    brand: {
        type:String,
        required: true,
    },
    warrantyInformation: String,
    returnPolicy: String,
    thumbnail: {
        type:String,
        required: true,
    },
    images: {
        type: [String]
    },

},{timestamps: true})


productSchema.index({
  title: "text",
  brand: "text",
  category: "text",
});


export default mongoose.model("Products", productSchema)