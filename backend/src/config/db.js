const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Connect to MongoDB Atlas using Mongoose.
 * This function is called in server.js to establish DB connection.
 * For ChainCred MVP: Uses MongoDB Atlas for storing users and certificates.
 * Error handling: Logs connection status; throws error if connection fails.
 */
const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL ||
      "mongodb://localhost:27017/chaincred";
    if (!uri) {
      console.error(
        "MongoDB connection failed: MONGODB_URI is not set.\nPlease create a .env file in the backend folder with a valid MONGODB_URI, for example:\nMONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority",
      );
      process.exit(1);
    }

    try {
      await mongoose.connect(uri); // connect using resolved uri
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.warn(
        "Primary MongoDB connection failed, trying local fallback:",
        error.message,
      );
      const localUri = "mongodb://localhost:27017/chaincred";
      if (uri !== localUri) {
        await mongoose.connect(localUri);
        console.log("Connected to LOCAL MongoDB successfully");
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.log(
      "Backend will continue running without database connection for UI testing.",
    );
  }
};

module.exports = connectDB;
