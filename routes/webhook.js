const express = require("express");
const router = express.Router();
const WebhookLog = require("../models/WebhookLog");
const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order"); // ← ADD THIS
const mongoose = require("mongoose"); // ← ADD THIS

// POST /webhook
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    console.log("🔔 Incoming Webhook:", JSON.stringify(payload, null, 2));

    // 1. Save webhook log for debugging
    await WebhookLog.create({ payload });

    // 2. Validate payload
    if (!payload.order_info || !payload.order_info.order_id) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const orderInfo = payload.order_info;

    // 3. Normalize fields (handle typos/inconsistencies from docs)
    const paymentDetails = orderInfo.payment_details || orderInfo.payemnt_details;
    const paymentMessage = orderInfo.payment_message || orderInfo.Payment_message;

    // 4. ✅ FIXED: Find or create the Order first
    let order = await Order.findOne({ _id: orderInfo.order_id });
    
    if (!order) {
      // Create a new order if it doesn't exist
      order = await Order.create({
        _id: orderInfo.order_id, // Use the order_id from webhook as _id
        school_id: "65b0e6293e9f76a9694d84b4", // From your assessment
        trustee_id: "65b0e552dd31950a9b41c5ba", // From your assessment
        student_info: {
          name: "Webhook Student",
          id: "WEBHOOK_" + Date.now(),
          email: "webhook@school.com"
        },
        gateway_name: orderInfo.gateway || "Unknown"
      });
    }

    // 5. Update OrderStatus in DB
    await OrderStatus.findOneAndUpdate(
      { collect_id: order._id }, // ← Use the order's _id
      {
        collect_id: order._id, // ← Ensure this is set
        order_amount: orderInfo.order_amount,
        transaction_amount: orderInfo.transaction_amount,
        payment_mode: orderInfo.payment_mode,
        payment_details: paymentDetails,
        bank_reference: orderInfo.bank_reference,
        payment_message: paymentMessage,
        status: orderInfo.status,
        error_message: orderInfo.error_message || "NA",
        payment_time: orderInfo.payment_time || new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(500).json({ error: err.message }); // ← Show actual error
  }
});

module.exports = router;