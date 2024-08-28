import mongoose, { ConnectOptions } from "mongoose";

const connectDB = async (): Promise<void> => {
  const options: ConnectOptions = {
    dbName: "pmx",
    retryWrites: true,
    serverSelectionTimeoutMS: 5000,
  };

  if (!process.env.MONGODB_URI) {
    const errorMsg = "MONGODB_URI environment variable is not defined";
    throw new Error(errorMsg);
  }
  //SET DEBUG
  // mongoose.set("debug", true);
  const uri: string = process.env.MONGODB_URI;

  if (mongoose.connection.readyState >= 1) {
    console.log("Using existing database connection");
    return;
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(uri, options);
    console.log("Database connected successfully to:", uri.split("@").pop());
  } catch (error) {
    console.error(
      "Error connecting to MongoDB:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};

export default connectDB;
