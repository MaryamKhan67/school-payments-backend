// routes/transactions.js
const express = require("express");
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1️⃣ Fetch all transactions WITH PAGINATION & SORTING
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sort || "payment_time";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "orderInfo",
        },
      },
      { $unwind: "$orderInfo" },
      {
        $project: {
          collect_id: 1,
          school_id: "$orderInfo.school_id",
          gateway: "$orderInfo.gateway_name",
          order_amount: 1,
          transaction_amount: 1,
          status: 1,
          custom_order_id: "$orderInfo._id",
          payment_time: 1,
          createdAt: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page: page } }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const transactions = await OrderStatus.aggregate(aggregationPipeline);

    const total = transactions[0]?.metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: transactions[0].data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      sort: {
        field: sortField,
        order: sortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Fetch transactions by school
router.get("/school/:schoolId", authMiddleware, async (req, res) => {
  try {
    const schoolId = req.params.schoolId;

    const transactions = await OrderStatus.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "orderInfo",
        },
      },
      { $unwind: "$orderInfo" },
      { $match: { "orderInfo.school_id": schoolId } },
      {
        $project: {
          collect_id: 1,
          school_id: "$orderInfo.school_id",
          gateway: "$orderInfo.gateway_name",
          order_amount: 1,
          transaction_amount: 1,
          status: 1,
          custom_order_id: "$orderInfo._id",
        },
      },
    ]);

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Check transaction status
router.get("/status/:custom_order_id", authMiddleware, async (req, res) => {
  try {
    const custom_order_id = req.params.custom_order_id;

    const status = await OrderStatus.findOne({ collect_id: custom_order_id });
    if (!status) return res.status(404).json({ error: "Transaction not found" });

    res.json({
      collect_id: status.collect_id,
      status: status.status,
      order_amount: status.order_amount,
      transaction_amount: status.transaction_amount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;