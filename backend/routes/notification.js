const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Helper to create and broadcast notification
const notify = async (io, { receiverId, receiverRole, title, message, type }) => {
  try {
    const notif = new Notification({
      receiverId: String(receiverId),
      receiverRole: receiverRole.toLowerCase(),
      title,
      message,
      type: type || 'general'
    });
    await notif.save();

    if (io) {
      // Broadcast to specific room
      if (receiverRole === 'customer') {
        io.to(`customer_${receiverId}`).emit('notification', notif);
      } else if (receiverRole === 'business') {
        io.to(`business_${receiverId}`).emit('notification', notif);
      } else if (receiverRole === 'staff') {
        io.to(`staff_${receiverId}`).emit('notification', notif);
        io.to(`business_${receiverId}`).emit('notification', notif); // Also notify business room for staff
      } else if (receiverRole === 'admin') {
        io.to('admin').emit('notification', notif);
      }
    }
    return notif;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// GET /api/notifications/:receiverRole/:receiverId - Fetch history
router.get('/:receiverRole/:receiverId', async (req, res) => {
  try {
    const { receiverRole, receiverId } = req.params;
    let query = {};

    if (receiverRole.toLowerCase() === 'staff') {
      query = {
        receiverRole: { $in: ['staff', 'business'] },
        receiverId: String(receiverId)
      };
    } else {
      query = {
        receiverRole: receiverRole.toLowerCase(),
        receiverId: String(receiverId)
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    const { receiverRole, receiverId } = req.body;
    await Notification.updateMany(
      { receiverRole: receiverRole.toLowerCase(), receiverId: String(receiverId), isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications read' });
  }
});

// DELETE /api/notifications/clear - Clear all
router.delete('/clear', async (req, res) => {
  try {
    const { receiverRole, receiverId } = req.body;
    await Notification.deleteMany({
      receiverRole: receiverRole.toLowerCase(),
      receiverId: String(receiverId)
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications' });
  }
});

// DELETE /api/notifications/:id - Delete single notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

module.exports = { router, notify };
