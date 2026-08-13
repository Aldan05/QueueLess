const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // E.g., '14:30'
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending', 'approved', 'checked_in', 'in_service', 'completed', 
      'suggested', 'rejected', 'cancelled', 'no_show'
    ],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  documents: [{
    type: { type: String }, // e.g., 'Aadhaar Card'
    frontImage: String,
    backImage: String
  }],
  bookingId: String,
  tokenNumber: String,
  verificationCode: String,
  rejectionReason: String,
  suggestedTime: String,
  service: String,
  partySize: Number,
  arrivalTime: Date,
  checkInTime: Date,
  counterNumber: String,
  servedAt: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
