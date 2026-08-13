const mongoose = require('mongoose');

const staffActivitySchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  counterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counter'
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  customersServed: {
    type: Number,
    default: 0
  },
  missedCustomers: {
    type: Number,
    default: 0
  },
  totalServiceTime: { // in minutes
    type: Number,
    default: 0
  },
  breakTimeUsed: { // in minutes
    type: Number,
    default: 0
  },
  lastBreakStart: {
    type: Date,
    default: null
  },
  shiftStart: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to quickly find a staff member's activity for a specific day
staffActivitySchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffActivity', staffActivitySchema);
