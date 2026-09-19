import mongoose from "mongoose";
import { env } from "../config/env.js";

let isMongoConnected = false;

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("No MONGO_URI provided. Using in-memory storage.");
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri);
    isMongoConnected = true;
    console.log("Connected to MongoDB.");
    return true;
  } catch (error) {
    console.warn("MongoDB connection failed. Falling back to in-memory storage.");
    console.warn(error.message);
    return false;
  }
}

export function mongoEnabled() {
  return isMongoConnected;
}
