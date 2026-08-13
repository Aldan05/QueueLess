const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalVisitors: {
    type: Number,
    default: 0
  },
  completedServices: {
    type: Number,
    default: 0
  },
  missedTokens: {
    type: Number,
    default: 0
  },
  averageWaitTimeMs: {
    type: Number,
    default: 0
  },
  busiestHour: {
    type: Number,
    default: null // 0-23
  }
}, { timestamps: true });

// Ensure one analytics document per business per day
AnalyticsSchema.index({ businessId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
