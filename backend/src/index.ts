import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import itemRoutes from "./routes/item.routes";
import customerRoutes from "./routes/customer.routes";
import saleRoutes from "./routes/sales.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);

// Error handling
app.use(errorMiddleware);

// Database connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
