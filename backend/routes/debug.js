const express = require('express');
const router = express.Router();

// Temporary debug endpoints for testing real-time notifications
// GET /api/debug/notify?businessId=<id>&message=<msg>
router.get('/notify', (req, res) => {
  const { businessId, message, type } = req.query;
  if (!businessId || !message) return res.status(400).json({ message: 'businessId and message are required' });

  try {
    if (req.io) {
      // Emit a general notification to the business room
      req.io.to(`business_${businessId}`).emit('notification', {
        type: type || 'debug',
        message: `[DEBUG] ${message}`
      });

      // Also emit a room-level event so listeners that react to queue/appointment changes can pick it up
      req.io.to(`business_${businessId}`).emit('debugNotification', { businessId, message, type: type || 'debug' });
    }

    return res.json({ success: true, businessId, message });
  } catch (err) {
    console.error('Debug notify error:', err);
    return res.status(500).json({ message: 'Failed to send debug notification' });
  }
});

module.exports = router;
