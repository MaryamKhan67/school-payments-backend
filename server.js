require("dotenv").config();

// Debug logging for environment variables
console.log('Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'NOT SET');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || '3000 (default)');

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // replaces bodyParser.json()

// Routes
const authRoutes = require("./routes/auth");
const createPaymentRoutes = require("./routes/createPayment");
const transactionRoutes = require("./routes/transactions");
const webhookRoutes = require("./routes/webhook");

app.use("/auth", authRoutes);
app.use("/create-payment", createPaymentRoutes);
app.use("/transactions", transactionRoutes);
app.use("/webhook", webhookRoutes);

// Test Route
app.get("/", (req, res) => res.send("School Payments API is running 🚀"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // optional: quick fail if wrong URI
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));