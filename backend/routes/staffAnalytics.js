const express = require('express');
const router = express.Router();
const StaffActivity = require('../models/StaffActivity');

// Helper to get today's date string
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// GET staff activity for today
router.get('/today/:staffId', async (req, res) => {
  try {
    const today = getTodayString();
    let activity = await StaffActivity.findOne({ staffId: req.params.staffId, date: today });
    
    if (!activity) {
      // Return empty stats if no activity exists yet for today
      return res.json({
        customersServed: 0,
        missedCustomers: 0,
        totalServiceTime: 0,
        breakTimeUsed: 0,
        avgServiceTime: 0,
        workingHours: '0h 0m'
      });
    }

    // Calculate metrics
    const avgServiceTime = activity.customersServed > 0 
      ? Math.round(activity.totalServiceTime / activity.customersServed) 
      : 0;

    // Calculate working hours (current time - shiftStart - breakTimeUsed)
    const diffMs = Date.now() - new Date(activity.shiftStart).getTime();
    const totalMinutes = Math.floor(diffMs / 60000);
    const activeMinutes = Math.max(0, totalMinutes - activity.breakTimeUsed);
    
    const hours = Math.floor(activeMinutes / 60);
    const mins = activeMinutes % 60;
    const workingHours = `${hours}h ${mins}m`;

    res.json({
      customersServed: activity.customersServed,
      missedCustomers: activity.missedCustomers,
      totalServiceTime: activity.totalServiceTime,
      breakTimeUsed: activity.breakTimeUsed,
      avgServiceTime,
      workingHours
    });

  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - Initialize shift (called on login)
router.post('/start-shift', async (req, res) => {
  try {
    const { businessId, staffId, counterId } = req.body;
    const today = getTodayString();
    
    let activity = await StaffActivity.findOne({ staffId, date: today });
    if (!activity) {
      activity = new StaffActivity({
        businessId,
        staffId,
        counterId,
        date: today
      });
      await activity.save();
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
