const express = require("express");
const {
  getTransactionsBySchool,
  getAllTransactions,
  getTransactionStatus
} = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1️⃣ Fetch all transactions WITH PAGINATION & SORTING
router.get("/", authMiddleware, getAllTransactions);

// 2️⃣ Fetch transactions by school
router.get("/school/:schoolId", authMiddleware, getTransactionsBySchool);

// 3️⃣ Check transaction status
router.get("/status/:custom_order_id", authMiddleware, getTransactionStatus);

module.exports = router;