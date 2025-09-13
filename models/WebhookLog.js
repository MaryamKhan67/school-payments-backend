const mongoose = require("mongoose");

const WebhookLogSchema = new mongoose.Schema({
  payload: Object,
  received_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WebhookLog", WebhookLogSchema);
