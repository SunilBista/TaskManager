import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = async (): Promise<void> => {
  const dbURI = process.env.MONGODB_URI;
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to the database");
  } catch (error) {
    console.log("Database connection failed: ", error);
    throw error;
  }
};

export default dbConfig;
