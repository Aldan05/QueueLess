const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  receiverId: { type: String, required: true }, // Can be userId, businessId, or 'admin'
  receiverRole: { type: String, enum: ['customer', 'business', 'staff', 'admin'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
