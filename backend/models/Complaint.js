const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reporterModel'
  },
  reporterModel: {
    type: String,
    required: true,
    enum: ['User', 'Business']
  },
  reporterType: {
    type: String,
    required: true,
    enum: ['Customer', 'Business']
  },
  reporterName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
