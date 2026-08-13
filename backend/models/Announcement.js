const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String,
    required: true,
    enum: ['All', 'Businesses', 'Customers', 'Admin'],
    default: 'All'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High'],
    default: 'Normal'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
