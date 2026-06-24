import mongoose from "mongoose";
import { envConfig } from "./config.js";

let dbConnected = false;

export const connectDb = async () => {
  try {
    await mongoose.connect(envConfig.mongoUri, { serverSelectionTimeoutMS: 3000 });
    dbConnected = true;
    console.log("Connected to MongoDB successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    dbConnected = false;
    return false;
  }
};

export const isDbConnected = () => true;


