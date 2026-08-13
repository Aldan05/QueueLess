const express = require('express');
const router = express.Router();
const Counter = require('../models/Counter');
const Staff = require('../models/Staff');
const StaffActivity = require('../models/StaffActivity');

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Get all counters for a business
router.get('/business/:businessId', async (req, res) => {
  try {
    const counters = await Counter.find({ businessId: req.params.businessId })
      .populate('currentStaffId', 'fullName employeeId status');
    res.json(counters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching counters' });
  }
});

// Create a new counter
router.post('/business/:businessId', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Counter name is required' });

    const newCounter = new Counter({
      businessId: req.params.businessId,
      name
    });
    await newCounter.save();
    
    // Broadcast counter update to business room
    if (req.io) {
      req.io.to(`business_${req.params.businessId}`).emit('counterUpdated', newCounter);
    }
    
    res.status(201).json(newCounter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating counter' });
  }
});

// Update counter details (e.g., status, assign staff)
router.patch('/:id', async (req, res) => {
  try {
    const { status, currentStaffId } = req.body;
    
    const counter = await Counter.findById(req.params.id);
    if (!counter) return res.status(404).json({ message: 'Counter not found' });
    
    if (status && status !== counter.status) {
      const oldStatus = counter.status;
      counter.status = status;
      
      // Track Break Time
      if (counter.currentStaffId) {
        const today = getTodayString();
        let activity = await StaffActivity.findOne({ staffId: counter.currentStaffId, date: today });
        
        if (activity) {
          if (status === 'Break') {
            activity.lastBreakStart = new Date();
            await activity.save();
          } else if (oldStatus === 'Break' && activity.lastBreakStart) {
            const breakDurationMs = new Date() - new Date(activity.lastBreakStart);
            const breakMins = Math.floor(breakDurationMs / 60000);
            activity.breakTimeUsed += breakMins;
            activity.lastBreakStart = null;
            await activity.save();
          }
        }
      }
    }
    
    if (currentStaffId !== undefined) {
      counter.currentStaffId = currentStaffId || null;
      // Also update the staff member's active counter reference if necessary
      if (currentStaffId) {
        await Staff.findByIdAndUpdate(currentStaffId, { counterId: counter._id });
      }
    }

    await counter.save();
    await counter.populate('currentStaffId', 'fullName employeeId status');

    if (req.io) {
      req.io.to(`business_${counter.businessId}`).emit('counterUpdated', counter);
    }
    
    res.json(counter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating counter' });
  }
});

// Delete a counter
router.delete('/:id', async (req, res) => {
  try {
    const counter = await Counter.findByIdAndDelete(req.params.id);
    if (!counter) return res.status(404).json({ message: 'Counter not found' });
    
    // Clear staff assignments for this counter
    await Staff.updateMany({ counterId: req.params.id }, { counterId: null });

    if (req.io) {
      req.io.to(`business_${counter.businessId}`).emit('counterDeleted', counter._id);
    }

    res.json({ message: 'Counter deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting counter' });
  }
});

module.exports = router;
