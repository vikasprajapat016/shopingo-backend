import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // no extra options

     console.log("✅ Connected to DB:", conn.connection.name);
    // console.log("🌍 Host:", conn.connection.host);

    const cols = await conn.connection.db.listCollections().toArray();
    // console.log("📦 Collections:", cols.map(c => c.name));

  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
