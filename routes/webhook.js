const express = require("express");
const router = express.Router();
const WebhookLog = require("../models/WebhookLog");
const OrderStatus = require("../models/OrderStatus");

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

    // 4. Update OrderStatus in DB
    await OrderStatus.findOneAndUpdate(
      { collect_id: orderInfo.order_id }, // may need ObjectId conversion if Orders are stored as ObjectIds
      {
        order_amount: orderInfo.order_amount,
        transaction_amount: orderInfo.transaction_amount,
        payment_mode: orderInfo.payment_mode,
        payment_details: paymentDetails,
        bank_reference: orderInfo.bank_reference,
        payment_message: paymentMessage,
        status: orderInfo.status,
        error_message: orderInfo.error_message,
        payment_time: orderInfo.payment_time,
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
