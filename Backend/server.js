import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", chatRoutes);

// 🔧 Database connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;   // ✅ match your .env

    console.log("Mongo URI:", uri);

    await mongoose.connect(uri);

    console.log("Connected with Database!");
  } catch (err) {
    console.log("Failed to connect with Db", err);
  }
};

// 🚀 Start server AFTER DB connects
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
};

startServer();