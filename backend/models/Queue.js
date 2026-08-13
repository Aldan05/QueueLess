const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  counter: {
    type: String, // E.g., "Counter 1", "Dr. Smith"
    default: null
  },
  status: {
    type: String,
    enum: ['pending_verification', 'info_requested', 'suggested_time', 'waiting', 'serving', 'completed', 'missed', 'cancelled', 'rejected'],
    default: 'waiting'
  },
  isPriority: {
    type: Boolean,
    default: false
  },
  joinTime: {
    type: Date,
    default: Date.now
  },
  callTime: {
    type: Date,
    default: null
  },
  completeTime: {
    type: Date,
    default: null
  },
  partySize: {
    type: Number,
    default: 1
  },
  purpose: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  
  // Suggestion Details for Live Queue
  suggestedTime: { type: String, default: null }, // e.g. "11:30 AM" or "14:30"
  suggestedDate: { type: Date, default: null },
  suggestedNote: { type: String, default: null },
  suggestedArriveBy: { type: String, default: null }, // 10 minutes prior
  suggestionAccepted: { type: Boolean, default: false },
  
  // Verification Details
  idNumber: { type: String, default: null },
  customerPhone: { type: String, default: null },
  documents: [{
    type: { type: String }, // e.g., "Aadhaar Card"
    frontImage: { type: String }, // Base64 string
    backImage: { type: String }, // Base64 string
    verified: { type: Boolean, default: false }
  }],
  verificationChecklist: {
    nameMatches: { type: Boolean, default: false },
    idValid: { type: Boolean, default: false },
    imageClear: { type: Boolean, default: false },
    serviceCorrect: { type: Boolean, default: false }
  },
  rejectionReason: { type: String, default: null },
  moreInfoReason: { type: String, default: null },
  verificationSubmittedAt: { type: Date, default: null }
}, { timestamps: true });

// Ensure a customer isn't waiting multiple times for the same business at once
QueueSchema.index({ businessId: 1, customerId: 1, status: 1 });

module.exports = mongoose.model('Queue', QueueSchema);
