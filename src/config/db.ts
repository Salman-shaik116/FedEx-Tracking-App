
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectToDb() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_NAME,
    });
    console.log("✅ Connected to MongoDB via Mongoose");
  } catch (err) {
    console.error("❌ Mongoose connection error:", err);
    process.exit(1);
  }
}
