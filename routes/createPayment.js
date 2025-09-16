// routes/createPayment.js
const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /create-payment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { school_id, trustee_id, student_info, order_amount, gateway_name } = req.body;

    // 1️⃣ Create Order in DB (FIXED: added order_amount)
    const order = await Order.create({
      school_id,
      trustee_id,
      student_info,
      gateway_name,
      order_amount    // ← THIS WAS MISSING!
    });

    // 2️⃣ Generate JWT payload (for payment API)
    const payload = {
      orderId: order._id.toString(),
      amount: order_amount,
      schoolId: school_id,
    };

    const signedPayload = jwt.sign(payload, process.env.PG_API_KEY, { algorithm: "HS256" });

    // 3️⃣ Send request to Payment Gateway API
    const response = await axios.post(
      "https://eduvanz-stage-collect.herokuapp.com/api/v1/collect/create",
      {
        pg_key: process.env.PG_KEY,
        school_id: process.env.SCHOOL_ID,
        order_id: order._id,
        order_amount: order_amount,
        payload: signedPayload,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PG_API_KEY}`,
        },
      }
    );

    // 4️⃣ Save Order Status in DB
    await OrderStatus.create({
      collect_id: order._id,
      order_amount,
      status: "pending",
      payment_time: new Date(),
    });

    // 5️⃣ Send payment link to frontend
    res.json({
      message: "Payment created",
      paymentLink: response.data?.redirect_url || "No redirect URL in response",
      orderId: order._id
    });

  } catch (err) {
    console.error("Payment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;