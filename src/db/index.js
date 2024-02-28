import mongoose from "mongoose";
import { DB_NAME, MONGODB_URL } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGODB_URL}/${DB_NAME}`
    );
    console.log("Connected DB Host", connectionInstance.connection.host);
  } catch (error) {
    console.error("DB connection error", error);
    process.exit(1);
  }
};

export { connectDB };
