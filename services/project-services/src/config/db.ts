import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "");

    console.log("✅ MongoDB Connected - Project Service");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔐 MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    const error = err as Error;
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};
