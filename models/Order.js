const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  school_id: { type: String, required: true },
  trustee_id: { type: String },
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String,
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
