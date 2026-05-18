import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

/**
 * Database Connection Configuration
 * Establishes a connection to the MongoDB database using Mongoose.
 * Also configures DNS servers to prevent resolution issues.
 */
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connected"),
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/rajgpt`);
  } catch (error) {
    console.log(`${error.message} Error Occured `);
  }
};

export default connectDB;
