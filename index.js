import express, { urlencoded } from "express"
import mongoose from "mongoose"
import productRoutes from  "./routes/productRoutes.js";
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from "dotenv"
import authRoutes from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoutes.js"
import uploadFile from "./routes/uploadFile.js"
import adminProductRoute from "./routes/adminProductRoute.js"
import orderRoute from "./routes/orderRoute.js"
import userOrderRoute from "./routes/userOrderRoute.js";
import categoryRoute from "./routes/categoryRoute.js"
import cartRoute from "./routes/cartRoute.js"
import { migrateProductCategories, seed , migrateCategoryIds} from "./controller/seedCategory.js";
import offerRoute from "./routes/offerRoute.js"
import userOfferRoutes from "./routes/userOfferRoutes.js";
import sliderRoute from "./routes/sliderRoute.js"
const app = express()
const port = 3002
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];
dotenv.config();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended:true}))

mongoose.connect("mongodb://127.0.0.1:27017/mydb")
.then( () => console.log("Database is connected"))
.catch( (err) => console.log(err) )

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}))
app.use("/uploads", express.static("uploads"));
app.use("/user" , authRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes)
app.use("/product", uploadFile)
app.use("/admin", adminProductRoute)
app.use("/admin", orderRoute)
app.use("/", userOrderRoute);
app.use("/admin", categoryRoute)
app.use("/cart", cartRoute)
app.use("/admin",offerRoute)
app.use("/admin", sliderRoute)
app.use("/user", userOfferRoutes)



app.use("/create", migrateCategoryIds)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});