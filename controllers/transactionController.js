const OrderStatus = require('../models/OrderStatus');
const Order = require('../models/Order');
const { ObjectId } = require('mongodb');

// Get transactions by school ID
const getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    console.log('Fetching transactions for school:', schoolId);

    const transactions = await OrderStatus.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "orderInfo"
        }
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
          payment_time: 1,
          createdAt: 1,
          student_info: "$orderInfo.student_info"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    console.log(`Found ${transactions.length} transactions for school ${schoolId}`);
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching school transactions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message 
    });
  }
};

// Get all transactions WITH PAGINATION & SORTING
const getAllTransactions = async (req, res) => {
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
          student_info: "$orderInfo.student_info"
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
      success: true,
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
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message 
    });
  }
};

// Check transaction status
const getTransactionStatus = async (req, res) => {
  try {
    const custom_order_id = req.params.custom_order_id;

    const status = await OrderStatus.findOne({ collect_id: custom_order_id });
    if (!status) return res.status(404).json({ 
      success: false,
      error: "Transaction not found" 
    });

    res.json({
      success: true,
      data: {
        collect_id: status.collect_id,
        status: status.status,
        order_amount: status.order_amount,
        transaction_amount: status.transaction_amount,
      }
    });
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transaction status',
      message: error.message 
    });
  }
};

module.exports = {
  getTransactionsBySchool,
  getAllTransactions,
  getTransactionStatus
};