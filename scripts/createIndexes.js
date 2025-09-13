// scripts/createIndexes.js
const mongoose = require("mongoose");
require("dotenv").config();

// Import models directly
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Create indexes using collection.createIndex() method
    await Order.collection.createIndex({ school_id: 1 });
    await OrderStatus.collection.createIndex({ collect_id: 1 });
    await OrderStatus.collection.createIndex({ payment_time: -1 });
    await OrderStatus.collection.createIndex({ status: 1 });

    console.log("✅ Indexes created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  }
};

createIndexes();