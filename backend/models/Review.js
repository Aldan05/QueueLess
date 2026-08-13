const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue'
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  waitTimeRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  staffBehaviourRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  feedback: {
    type: String,
    required: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
