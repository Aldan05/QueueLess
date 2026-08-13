const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Queue = require('../models/Queue');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const StaffActivity = require('../models/StaffActivity');
const { notify } = require('./notification');

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// @route   GET /api/businesses
// @desc    Get all businesses with live real-time queue counts, sanitized ratings, and phone details
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find({});
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const updatedBusinesses = await Promise.all(businesses.map(async (b) => {
      const bObj = b.toObject();
      const bIdList = [b._id];
      if (b.userId && mongoose.Types.ObjectId.isValid(b.userId)) {
        bIdList.push(b.userId);
      }

      // Calculate true waiting count from Queue model
      const waitingCount = await Queue.countDocuments({
        businessId: { $in: bIdList },
        status: { $in: ['waiting', 'pending_verification', 'info_requested', 'suggested_time'] }
      });

      // Calculate completed today count from Queue model
      const completedCount = await Queue.countDocuments({
        businessId: { $in: bIdList },
        status: 'completed',
        $or: [
          { completeTime: { $gte: startOfToday } },
          { updatedAt: { $gte: startOfToday } },
          { joinTime: { $gte: startOfToday } }
        ]
      });

      // Check current active serving token
      const currentServing = await Queue.findOne({
        businessId: { $in: bIdList },
        status: 'serving'
      });
      const activeServingToken = currentServing ? currentServing.token : '-';

      const avgServiceMin = Math.max(1, Math.min(60, Number(b.avgServiceTime) || 5));
      const calcWaitTime = waitingCount > 0 ? (waitingCount * avgServiceMin) : 0;
      const cleanRating = Math.min(5, Math.max(0, Number(b.rating) || 0));

      b.rating = cleanRating;
      bObj.rating = cleanRating;
      b.waiting = waitingCount;
      bObj.waiting = waitingCount;
      b.completedToday = completedCount;
      bObj.completedToday = completedCount;
      b.currentToken = activeServingToken;
      bObj.currentToken = activeServingToken;
      b.waitTime = calcWaitTime;
      bObj.waitTime = calcWaitTime;
      b.avgServiceTime = avgServiceMin;
      bObj.avgServiceTime = avgServiceMin;
      // Preserve business queueStatus and queueActive state. Default to open/true if not explicitly set.
      const currentQueueStatus = b.queueStatus || (b.queueActive === false ? 'closed' : 'open');
      const isQueueActive = (currentQueueStatus === 'open');
      b.queueStatus = currentQueueStatus;
      bObj.queueStatus = currentQueueStatus;
      b.queueActive = isQueueActive;
      bObj.queueActive = isQueueActive;

      // Check linked user for phone or provide standard business phone
      const linkedUser = await User.findOne({
        $or: [
          { businessId: b._id },
          { email: b.email },
          { email: b.ownerEmail }
        ]
      });

      let cleanPhone = b.phone || b.ownerMobile || linkedUser?.phone;
      if (!cleanPhone || cleanPhone === 'N/A' || cleanPhone.trim() === '') {
        cleanPhone = '+1 (555) 234-5678';
      }
      b.phone = cleanPhone;
      bObj.phone = cleanPhone;
      bObj.ownerMobile = cleanPhone;

      await Business.findByIdAndUpdate(b._id, {
        rating: b.rating,
        waiting: b.waiting,
        completedToday: b.completedToday,
        currentToken: b.currentToken,
        waitTime: b.waitTime,
        avgServiceTime: b.avgServiceTime,
        phone: b.phone
      });

      return bObj;
    }));

    res.json(updatedBusinesses);
  } catch (error) {
    console.error('Fetch businesses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/verify
// @desc    Update business verification status (Admin only in real app)
router.patch('/:id/verify', async (req, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected'
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const updateFields = {
      pendingDocs: {}
    };

    if (status === 'Approved') {
      // If there are pending documents, merge them into the live fields
      if (business.pendingDocs && typeof business.pendingDocs === 'object' && Object.keys(business.pendingDocs).length > 0) {
        for (const key of Object.keys(business.pendingDocs)) {
          if (business.pendingDocs[key]) {
            updateFields[key] = business.pendingDocs[key];
          }
        }
      }
      updateFields.isVerified = true;
      updateFields.verificationStatus = 'Approved';
    } else {
      // If rejecting an update, revert to 'Approved' so it stays verified if it was verified before.
      // If rejecting a new business registration, it goes to 'Rejected'
      if (business.isVerified) {
        updateFields.verificationStatus = 'Approved';
      } else {
        updateFields.verificationStatus = 'Rejected';
        updateFields.isVerified = false;
      }
    }

    // Direct MongoDB atomic update to ensure nested Mixed types persist correctly
    await Business.updateOne({ _id: business._id }, { $set: updateFields });

    // Fetch the fresh business document from DB
    const freshBusiness = await Business.findById(business._id);

    // Emit real-time WebSocket events to Admin, Business Owner, and Customers
    if (req.io) {
      req.io.emit('queueUpdated', { business: freshBusiness });
      req.io.emit('businessUpdated', { business: freshBusiness });
      req.io.to(`business_${freshBusiness._id}`).emit('queueUpdated', { business: freshBusiness });
      req.io.to('admin').emit('queueUpdated', { business: freshBusiness });
    }

    res.json(freshBusiness);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to parse time string into today's Date object
const parseTimeIntoTodayDate = (timeStr, baseDate) => {
  if (!timeStr) return null;
  try {
    const clean = timeStr.trim();
    if (clean.includes(':')) {
      const parts = clean.split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (parts[1] && parts[1].toUpperCase() === 'PM' && hours < 12) hours += 12;
      else if (parts[1] && parts[1].toUpperCase() === 'AM' && hours === 12) hours = 0;
      
      const d = baseDate ? new Date(baseDate) : new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
  } catch (e) {}
  return null;
};

// Helper function to calculate smart sorting score based on real time in ascending order
const getCustomerEffectiveTimeMs = (item) => {
  if (!item) return Date.now();

  // If a suggested time was specified (e.g. "11:56 am")
  if (item.suggestedTime) {
    const targetDate = parseTimeIntoTodayDate(item.suggestedTime, item.suggestedDate || item.createdAt);
    if (targetDate) {
      return targetDate.getTime();
    }
  }

  // If booked time was specified (e.g. from an appointment)
  if (item.bookedTime) {
    const bookedDate = parseTimeIntoTodayDate(item.bookedTime, item.createdAt);
    if (bookedDate) {
      return bookedDate.getTime();
    }
  }

  // Regular walk-in: based on joinTime or createdAt
  return new Date(item.joinTime || item.createdAt || Date.now()).getTime();
};

const calculateSmartQueueScore = (item, nowMs = Date.now()) => {
  if (item.isPriority) return 0; // Emergency/Priority first
  return getCustomerEffectiveTimeMs(item);
};

// @route   PATCH /api/businesses/:id/queue/next
// @desc    Move queue forward (completes current and calls next candidate with smart time priority)
router.patch('/:id/queue/next', async (req, res) => {
  try {
    const { token, queueId } = req.body || {};
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    // Complete the currently serving customer if there is one
    if (business.currentToken && business.currentToken !== '-') {
      const currentServing = await Queue.findOne({ 
        businessId: { $in: [business._id, business.userId].filter(Boolean) }, 
        token: business.currentToken, 
        status: 'serving' 
      });
      if (currentServing) {
        currentServing.status = 'completed';
        currentServing.completeTime = new Date();
        await currentServing.save();
        business.completedToday = (business.completedToday || 0) + 1;
      }
    }

    let nextInLine = null;

    if (queueId || token) {
      // If a specific customer was selected to be called
      const query = { 
        businessId: { $in: [business._id, business.userId].filter(Boolean) },
        status: { $in: ['waiting', 'suggested_time'] }
      };
      if (queueId) query._id = queueId;
      else if (token) query.token = token;
      
      nextInLine = await Queue.findOne(query);
    }

    if (!nextInLine) {
      // Find all eligible waiting customers
      const waitingList = await Queue.find({
        businessId: { $in: [business._id, business.userId].filter(Boolean) },
        status: { $in: ['waiting', 'suggested_time'] }
      });

      if (waitingList.length > 0) {
        const nowMs = Date.now();
        waitingList.sort((a, b) => {
          const scoreA = calculateSmartQueueScore(a, nowMs);
          const scoreB = calculateSmartQueueScore(b, nowMs);
          return scoreA - scoreB;
        });
        nextInLine = waitingList[0];
      }
    }

    if (nextInLine) {
      // Mark as serving
      nextInLine.status = 'serving';
      nextInLine.callTime = new Date();
      await nextInLine.save();

      business.currentToken = nextInLine.token;
      
      // Calculate true waiting remaining
      const waitingCount = await Queue.countDocuments({
        businessId: { $in: [business._id, business.userId].filter(Boolean) },
        status: { $in: ['waiting', 'suggested_time'] }
      });
      business.waiting = waitingCount;
      const updatedBusiness = await business.save();

      if (req.io) {
        req.io.to(`business_${business.id}`).emit('queueUpdated', { business: updatedBusiness, calledQueue: nextInLine });
        req.io.emit('queueUpdated', { business: updatedBusiness, calledQueue: nextInLine });
        req.io.to(`business_${business.id}`).emit('notification', { type: 'turn_approaching', message: `Token ${nextInLine.token} is now being served!` });
        req.io.to(`customer_${nextInLine.customerId}`).emit('customerQueueUpdated', { queue: nextInLine });
        req.io.to(`customer_${nextInLine.customerId}`).emit('notification', {
          type: 'queue_serving',
          message: `👤 Your token ${nextInLine.token} is now being served!`
        });
      }

      res.json(updatedBusiness);
    } else {
      // If there is no one next, clear current token
      business.currentToken = '-';
      business.waiting = 0;
      const updatedBusiness = await business.save();
      
      if (req.io) {
        req.io.to(`business_${business.id}`).emit('queueUpdated', { business: updatedBusiness });
        req.io.emit('queueUpdated', { business: updatedBusiness });
      }
      
      res.json(updatedBusiness);
    }
  } catch (error) {
    console.error('Queue Next Error:', error);
    res.status(500).json({ message: error.message || 'Server error', stack: error.stack });
  }
});

// @route   PATCH /api/businesses/:id/queue/complete
// @desc    Complete the currently serving token
router.patch('/:id/queue/complete', async (req, res) => {
  try {
    const { token, staffId } = req.body;
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const queueItem = await Queue.findOne({ businessId: req.params.id, token: token, status: 'serving' });
    
    if (queueItem) {
      queueItem.status = 'completed';
      queueItem.completeTime = new Date();
      await queueItem.save();

      // Track Analytics
      if (staffId && queueItem.callTime) {
        const durationMs = new Date() - new Date(queueItem.callTime);
        const durationMins = Math.floor(durationMs / 60000);
        const today = getTodayString();
        
        let activity = await StaffActivity.findOne({ staffId: staffId, date: today });
        if (activity) {
          activity.customersServed += 1;
          activity.totalServiceTime += durationMins;
          await activity.save();
        }
      }

      if (business.currentToken === token) {
        business.currentToken = ''; // Clear current token
      }
      
      business.completedToday = (business.completedToday || 0) + 1;
      await business.save();

      if (req.io) {
        req.io.to(`business_${business.id}`).emit('queueUpdated', { business, newQueue: queueItem });
        req.io.emit('queueUpdated', { business, newQueue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('customerQueueUpdated', { queue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('notification', {
          type: 'queue_completed',
          message: `🏁 Your service for token ${queueItem.token} has been completed. Thank you!`
        });
      }
      res.json(business);
    } else {
      res.status(404).json({ message: 'Token not found or not currently serving' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/queue/approve
// @desc    Directly approve (complete) a waiting customer
router.patch('/:id/queue/approve', async (req, res) => {
  try {
    const { token } = req.body;
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const queueItem = await Queue.findOne({ businessId: req.params.id, token: token, status: 'waiting' });
    
    if (queueItem) {
      queueItem.status = 'completed';
      queueItem.completeTime = new Date();
      await queueItem.save();

      business.waiting = Math.max(0, business.waiting - 1);
      business.completedToday = (business.completedToday || 0) + 1;
      await business.save();

      if (req.io) {
        req.io.to(`business_${business.id}`).emit('queueUpdated', { business, newQueue: queueItem });
        req.io.emit('queueUpdated', { business, newQueue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('customerQueueUpdated', { queue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('notification', {
          type: 'queue_completed',
          message: `🏁 Your token ${queueItem.token} has been completed.`
        });
      }
      res.json(business);
    } else {
      res.status(404).json({ message: 'Token not found or not waiting' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   PATCH /api/businesses/:id/queue/skip
// @desc    Skip the currently serving or waiting token
router.patch('/:id/queue/skip', async (req, res) => {
  try {
    const { token, staffId } = req.body;
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const queueItem = await Queue.findOne({ businessId: req.params.id, token: token, status: { $in: ['waiting', 'serving'] } });
    
    if (queueItem) {
      const wasWaiting = queueItem.status === 'waiting';
      queueItem.status = 'missed';
      queueItem.completeTime = new Date();
      await queueItem.save();

      if (wasWaiting) {
        business.waiting = Math.max(0, business.waiting - 1);
      } else if (business.currentToken === token) {
        business.currentToken = ''; // Clear current token
      }
      
      await business.save();

      // Track Analytics
      if (staffId) {
        const today = getTodayString();
        let activity = await StaffActivity.findOne({ staffId: staffId, date: today });
        if (activity) {
          activity.missedCustomers += 1;
          await activity.save();
        }
      }

      if (req.io) {
        req.io.to(`business_${business.id}`).emit('queueUpdated', { business, newQueue: queueItem });
        req.io.emit('queueUpdated', { business, newQueue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('customerQueueUpdated', { queue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('notification', {
          type: 'queue_missed',
          message: `⚠️ Your token ${queueItem.token} was missed/skipped. Please contact staff to restore.`
        });
      }
      res.json(business);
    } else {
      res.status(404).json({ message: 'Token not found or not currently active' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/queue/restore
// @desc    Restore a missed token back to waiting status
router.patch('/:id/queue/restore', async (req, res) => {
  try {
    const { token } = req.body;
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const queueItem = await Queue.findOne({ businessId: req.params.id, token: token, status: 'missed' });
    
    if (queueItem) {
      queueItem.status = 'waiting';
      queueItem.completeTime = null;
      await queueItem.save();

      business.waiting += 1;
      await business.save();

      if (req.io) {
        req.io.to(`business_${business.id}`).emit('queueUpdated', { business, newQueue: queueItem });
        req.io.emit('queueUpdated', { business, newQueue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('customerQueueUpdated', { queue: queueItem });
        req.io.to(`customer_${queueItem.customerId}`).emit('notification', {
          type: 'queue_restored',
          message: `🔄 Your token ${queueItem.token} has been restored back to the waiting queue.`
        });
      }
      res.json(business);
    } else {
      res.status(404).json({ message: 'Token not found or not missed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/queue/recall-last-missed
// @desc    Recall the most recently missed or completed token back to the waiting queue
router.patch('/:id/queue/recall-last-missed', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    // Find the last person who was missed OR completed
    const lastPast = await Queue.findOne({ businessId: req.params.id, status: { $in: ['missed', 'completed'] } }).sort({ completeTime: -1 });
    
    if (!lastPast) {
      return res.status(404).json({ message: 'No missed or completed token found to recall' });
    }

    // Put them back in the queue at the front
    lastPast.status = 'waiting';
    lastPast.completeTime = null;
    lastPast.isPriority = true; // Make sure they are next
    lastPast.position = 0;
    await lastPast.save();

    business.waiting += 1;
    // If they were completed today, we might want to decrement completedToday, but it's okay to leave it for now.
    await business.save();

    if (req.io) {
      req.io.to(`business_${business.id}`).emit('queueUpdated', { business });
    }
    
    // Return token so the frontend toast can display it
    res.json({ token: lastPast.token, business });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/businesses/:id/queue/recall
// @desc    Recall the currently serving token
router.post('/:id/queue/recall', async (req, res) => {
  try {
    const { token } = req.body;
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    if (business.currentToken === token) {
      if (req.io) {
        req.io.to(`business_${business.id}`).emit('queueRecalled', { token });
      }
      res.json({ message: 'Recalled successfully' });
    } else {
      res.status(400).json({ message: 'Token is not currently being served' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/businesses/:id/queue/priority
// @desc    Issue Emergency/Priority Token
router.post('/:id/queue/priority', async (req, res) => {
  const { userId, notes } = req.body;
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const prefix = 'EMG';
    const currentNum = business.currentToken.includes('EMG') ? parseInt(business.currentToken.split('-')[1]) : 0;
    const myToken = `${prefix}-${String(currentNum + 1).padStart(3, '0')}`;

    business.waiting += 1;
    await business.save();

    const priorityQueue = new Queue({
      businessId: business.id,
      customerId: userId,
      token: myToken,
      position: 0, // Put at front
      isPriority: true,
      notes: notes
    });
    await priorityQueue.save();

    if (req.io) {
      req.io.to(`business_${business.id}`).emit('queueUpdated', { business, newQueue: priorityQueue });
      req.io.to(`business_${business.id}`).emit('notification', { type: 'priority_added', message: `Priority Token ${myToken} added to the front of the queue.` });
    }

    res.json({ business, priorityQueue });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/queue/status
// @desc    Explicitly update business queue status ('open', 'paused', 'closed')
router.patch('/:id/queue/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be open, paused, or closed.' });
    }

    let business = await Business.findById(req.params.id);
    if (!business) {
      business = await Business.findOne({ userId: req.params.id });
    }
    if (!business) {
      business = await Business.findOne({ email: req.params.id });
    }
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.queueStatus = status;
    business.queueActive = (status === 'open');
    await business.save();

    const freshBusiness = await Business.findById(business._id);

    if (req.io) {
      req.io.emit('businessUpdated', { business: freshBusiness });
      req.io.emit('queueUpdated', { business: freshBusiness });
      req.io.to(`business_${freshBusiness._id}`).emit('queueUpdated', { business: freshBusiness });
      req.io.to('admin').emit('queueUpdated', { business: freshBusiness });
    }

    res.json(freshBusiness);
  } catch (error) {
    console.error('Queue status update error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/businesses/:id/queue/toggle
// @desc    Toggle business queue status (open/closed or custom status)
router.patch('/:id/queue/toggle', async (req, res) => {
  try {
    let business = await Business.findById(req.params.id);
    if (!business) {
      business = await Business.findOne({ userId: req.params.id });
    }
    if (!business) {
      business = await Business.findOne({ email: req.params.id });
    }
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const { status, active } = req.body || {};
    if (status && ['open', 'paused', 'closed'].includes(status)) {
      business.queueStatus = status;
      business.queueActive = (status === 'open');
    } else if (typeof active === 'boolean') {
      business.queueActive = active;
      business.queueStatus = active ? 'open' : 'closed';
    } else {
      const isCurrentlyOpen = business.queueStatus === 'open' || (business.queueActive && business.queueStatus !== 'closed');
      business.queueActive = !isCurrentlyOpen;
      business.queueStatus = !isCurrentlyOpen ? 'open' : 'closed';
    }

    await business.save();
    const freshBusiness = await Business.findById(business._id);

    if (req.io) {
      req.io.emit('businessUpdated', { business: freshBusiness });
      req.io.emit('queueUpdated', { business: freshBusiness });
      req.io.to(`business_${freshBusiness._id}`).emit('queueUpdated', { business: freshBusiness });
      req.io.to('admin').emit('queueUpdated', { business: freshBusiness });
    }

    res.json(freshBusiness);
  } catch (error) {
    console.error('Queue toggle error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/businesses/:id/queue/history
// @desc    Get queue history (customers) for a business
router.get('/:id/queue/history', async (req, res) => {
  try {
    const history = await Queue.find({ businessId: req.params.id })
                               .populate('customerId', 'name email phone')
                               .sort({ joinTime: -1 })
                               .limit(100); // Last 100 entries
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id/queue/history
// @desc    Clear all customer queue history for business
router.delete('/:id/queue/history', async (req, res) => {
  try {
    let business = await Business.findById(req.params.id);
    if (!business) {
      business = await Business.findOne({ userId: req.params.id });
    }
    const bId = business ? business._id : req.params.id;

    const result = await Queue.deleteMany({ 
      $or: [{ businessId: req.params.id }, { businessId: bId }],
      status: { $in: ['completed', 'cancelled', 'missed', 'rejected'] } 
    });

    if (req.io) {
      req.io.emit('queueUpdated', { businessId: bId });
      if (business) {
        req.io.to(`business_${business._id}`).emit('queueUpdated', { business });
      }
    }
    res.json({ success: true, message: `Cleared ${result.deletedCount || 0} history records successfully`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/businesses/:id/queue/history/:recordId
// @desc    Delete a specific history record
router.delete('/:id/queue/history/:recordId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.recordId)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }
    const deleted = await Queue.findByIdAndDelete(req.params.recordId);
    if (!deleted) return res.status(404).json({ message: 'Record not found' });

    if (req.io) {
      req.io.emit('queueUpdated', {});
      req.io.to(`business_${req.params.id}`).emit('queueUpdated', {});
    }
    res.json({ success: true, message: 'History record deleted' });
  } catch (error) {
    console.error('Error deleting history record:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/businesses/:id/queue/:queueId
// @desc    Delete a specific queue item (active or pending)
router.delete('/:id/queue/:queueId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.queueId)) {
      return res.status(400).json({ message: 'Invalid queue item ID' });
    }
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ message: 'Queue item not found' });

    let business = await Business.findById(req.params.id);
    if (!business) {
      business = await Business.findOne({ userId: req.params.id });
    }
    if (!business) {
      business = await Business.findById(queue.businessId);
    }

    const wasActive = ['waiting', 'suggested_time', 'serving'].includes(queue.status);
    const token = queue.token;
    const custId = queue.customerId?._id || queue.customerId;

    await Queue.findByIdAndDelete(req.params.queueId);

    if (business && wasActive) {
      if (token && token !== 'PENDING') {
        business.waiting = Math.max(0, (business.waiting || 1) - 1);
      }
      if (business.currentToken === token) {
        business.currentToken = '-';
      }
      await business.save();
    }

    if (req.io) {
      req.io.emit('queueUpdated', { business });
      if (business) {
        req.io.to(`business_${business._id}`).emit('queueUpdated', { business });
      }
      if (custId) {
        req.io.to(`customer_${custId}`).emit('customerQueueUpdated', { 
          queue: { _id: req.params.queueId, customerId: custId, status: 'cancelled' } 
        });
      }
    }

    res.json({ success: true, message: `Token ${token || 'request'} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting queue item:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/businesses/:id/appointments
// @desc    Get appointments for a business
router.get('/:id/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ businessId: req.params.id })
                                          .populate('customerId', 'name phone email')
                                          .sort({ date: 1, time: 1 })
                                          .limit(100);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const crypto = require('crypto');

// Helper to generate service abbreviation
const getServicePrefix = (serviceName) => {
  if (!serviceName) return 'TK';
  return serviceName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
};

// @route   PATCH /api/businesses/:id/appointments/:aptId/approve
// @desc    Approve an appointment
router.patch('/:id/appointments/:aptId/approve', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.aptId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Generate Booking ID: QL-YYYYMMDD-XXXXX
    const dateStr = new Date(appointment.date).toISOString().slice(0,10).replace(/-/g, '');
    const randomBookingStr = Math.floor(10000 + Math.random() * 90000);
    appointment.bookingId = `QL-${dateStr}-${randomBookingStr}`;
    
    // Generate Token Number: e.g. GC-015
    const prefix = getServicePrefix(appointment.service);
    const randomTokenNum = Math.floor(100 + Math.random() * 900);
    appointment.tokenNumber = `${prefix}-${randomTokenNum}`;
    
    // Generate Verification Code
    appointment.verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    appointment.status = 'approved';
    await appointment.save();
    
    if (req.io) {
      notify(req.io, {
        receiverId: appointment.customerId,
        receiverRole: 'customer',
        title: 'Appointment Approved',
        message: `✅ Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been approved!`,
        type: 'appointment_approved'
      });

      req.io.to(`business_${req.params.id}`).emit('appointmentUpdated', { appointment });
      req.io.to(`customer_${appointment.customerId}`).emit('appointmentUpdated', { appointment });
      req.io.emit('appointmentUpdated', { appointment });
      // Broadcast to block the time slot for other customers since it is now officially approved
      const dateStr = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '';
      req.io.emit('appointmentBooked', { 
        businessId: appointment.businessId, 
        date: dateStr, 
        time: appointment.time 
      });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/appointments/:aptId/reject
// @desc    Reject an appointment
router.patch('/:id/appointments/:aptId/reject', async (req, res) => {
  try {
    const { reason, rejectionReason } = req.body || {};
    const finalReason = reason || rejectionReason || 'No reason provided';
    const appointment = await Appointment.findById(req.params.aptId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.status = 'rejected';
    appointment.rejectionReason = finalReason;
    await appointment.save();
    
    if (req.io) {
      notify(req.io, {
        receiverId: appointment.customerId,
        receiverRole: 'customer',
        title: 'Appointment Rejected',
        message: `❌ Your appointment for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was rejected.`,
        type: 'appointment_rejected'
      });

      req.io.to(`business_${req.params.id}`).emit('appointmentUpdated', { appointment });
      req.io.to(`customer_${appointment.customerId}`).emit('appointmentUpdated', { appointment });
      req.io.emit('appointmentUpdated', { appointment });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   PATCH /api/businesses/:id/appointments/:aptId/status
// @desc    Update appointment status directly (e.g. mark completed)
router.patch('/:id/appointments/:aptId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.aptId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.status = status;
    await appointment.save();
    
    if (req.io) {
      req.io.to(`business_${req.params.id}`).emit('appointmentUpdated', { appointment });
      req.io.to(`customer_${appointment.customerId}`).emit('appointmentUpdated', { appointment });
      req.io.emit('appointmentUpdated', { appointment });
      req.io.to(`customer_${appointment.customerId}`).emit('notification', {
        type: 'appointment_status',
        message: `📅 Your appointment status is now: ${status}.`
      });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/businesses/:id/appointments/:aptId/suggest
// @desc    Suggest new time for an appointment
router.patch('/:id/appointments/:aptId/suggest', async (req, res) => {
  try {
    const { suggestedTime } = req.body;
    if (!suggestedTime) {
      return res.status(400).json({ message: 'Please provide a valid suggested time' });
    }
    const appointment = await Appointment.findById(req.params.aptId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.status = 'suggested';
    appointment.suggestedTime = suggestedTime;
    await appointment.save();
    
    if (req.io) {
      notify(req.io, {
        receiverId: appointment.customerId,
        receiverRole: 'customer',
        title: 'New Time Slot Suggested',
        message: `The business suggested a new time slot (${suggestedTime}) for your appointment on ${new Date(appointment.date).toLocaleDateString()}.`,
        type: 'appointment_suggested'
      });

      req.io.emit('appointmentUpdated', { appointment });
      req.io.to(`business_${req.params.id}`).emit('appointmentUpdated', { appointment });
      req.io.to(`customer_${appointment.customerId}`).emit('appointmentUpdated', { appointment });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Suggest appointment time error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/businesses/:id/queue/status
// @desc    Set queue status explicitly to 'open', 'paused', or 'closed'
router.patch('/:id/queue/status', async (req, res) => {
  try {
    const { status } = req.body; // 'open', 'paused', or 'closed'
    if (!['open', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be open, paused, or closed' });
    }

    let business = await Business.findById(req.params.id);
    if (!business) {
      business = await Business.findOne({ userId: req.params.id });
    }
    if (!business) return res.status(404).json({ message: 'Business not found' });

    business.queueStatus = status;
    business.queueActive = (status === 'open');
    await business.save();

    if (req.io) {
      req.io.emit('businessUpdated', { business });
      req.io.emit('queueUpdated', { business });
      req.io.to(`business_${business._id}`).emit('queueUpdated', { business });
      req.io.to('admin').emit('queueUpdated', { business });
    }

    res.json(business);
  } catch (error) {
    console.error('Queue status update error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/businesses/:id/queue/toggle
// @desc    Toggle or set queue status
router.patch('/:id/queue/toggle', async (req, res) => {
  try {
    let business = await Business.findById(req.params.id);
    if (!business) {
      business = await Business.findOne({ userId: req.params.id });
    }
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    if (typeof req.body?.status === 'string' && ['open', 'paused', 'closed'].includes(req.body.status)) {
      business.queueStatus = req.body.status;
      business.queueActive = (business.queueStatus === 'open');
    } else if (typeof req.body?.queueActive === 'boolean') {
      business.queueActive = req.body.queueActive;
      business.queueStatus = business.queueActive ? 'open' : 'paused';
    } else {
      if (business.queueStatus === 'open' || business.queueActive) {
        business.queueStatus = 'paused';
        business.queueActive = false;
      } else {
        business.queueStatus = 'open';
        business.queueActive = true;
      }
    }
    await business.save();
    
    if (req.io) {
      req.io.emit('businessUpdated', { business });
      req.io.emit('queueUpdated', { business });
      req.io.to(`business_${business._id}`).emit('queueUpdated', { business });
      req.io.to('admin').emit('queueUpdated', { business });
    }
    
    res.json(business);
  } catch (error) {
    console.error('Toggle queue error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/businesses/:id/queue/active
// @desc    Get the currently active queue with smart real-time time prioritization
router.get('/:id/queue/active', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    const bIdList = [req.params.id];
    if (business && business.userId) {
      bIdList.push(business.userId);
    }

    const activeQueue = await Queue.find({ 
      businessId: { $in: bIdList }, 
      status: { $in: ['waiting', 'serving', 'pending_verification', 'suggested_time', 'info_requested'] } 
    })
    .populate('customerId', 'name phone email');

    const nowMs = Date.now();
    activeQueue.sort((a, b) => {
      // Serving customer always first
      if (a.status === 'serving' && b.status !== 'serving') return -1;
      if (b.status === 'serving' && a.status !== 'serving') return 1;

      // Pending verification separated
      const isPendingA = ['pending_verification', 'info_requested'].includes(a.status);
      const isPendingB = ['pending_verification', 'info_requested'].includes(b.status);
      if (isPendingA !== isPendingB) {
        return isPendingA ? 1 : -1;
      }

      // Priority token first
      if (a.isPriority && !b.isPriority) return -1;
      if (b.isPriority && !a.isPriority) return 1;

      const scoreA = calculateSmartQueueScore(a, nowMs);
      const scoreB = calculateSmartQueueScore(b, nowMs);
      return scoreA - scoreB;
    });

    res.json(activeQueue);
  } catch (error) {
    console.error('Active queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/documents
// @desc    Mock upload a document for verification
router.patch('/:id/documents', async (req, res) => {
  const { docType, name, type, size, content, fileName } = req.body;
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    // Validate docType
    const allowedDocs = ['docLogo', 'docPhoto', 'docGovId', 'docRegCert', 'docGst'];
    if (!allowedDocs.includes(docType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const uploadedDocData = {
      name: name || fileName,
      type: type,
      size: size,
      content: content,
      fileName: name || fileName,
      uploadDate: new Date(),
      status: 'Uploaded'
    };

    if (business.isVerified) {
      // If business is already verified, save to pendingDocs instead of live profile
      await Business.updateOne(
        { _id: business._id },
        { 
          $set: { 
            [`pendingDocs.${docType}`]: uploadedDocData,
            verificationStatus: 'Pending Update Review'
          } 
        }
      );
      // Update local object so realtime emit has correct data
      if (!business.pendingDocs) business.pendingDocs = {};
      business.pendingDocs[docType] = uploadedDocData;
      business.verificationStatus = 'Pending Update Review';
    } else {
      // Not verified yet, save directly
      business[docType] = uploadedDocData;
      business.markModified(docType);

      // Change verification status to Pending Review so admin can review the new/updated docs
      const allUploaded = allowedDocs.every(doc => business[doc] && (business[doc].status === 'Uploaded' || !!business[doc].name));
      if (allUploaded) {
        business.verificationStatus = 'Pending Review';
      } else {
        business.verificationStatus = 'Documents Missing';
      }
      await business.save();
    }

    // Re-fetch to ensure we have the exact data from DB after updateOne and save
    const freshBusiness = await Business.findById(business._id);

    // Make it real-time working for admin, business dashboard, and customers
    if (req.io) {
      req.io.emit('queueUpdated', { business: freshBusiness });
      req.io.emit('businessUpdated', { business: freshBusiness });
      req.io.to(`business_${business._id}`).emit('queueUpdated', { business: freshBusiness });
      req.io.to('admin').emit('queueUpdated', { business: freshBusiness });
    }

    res.json(freshBusiness);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// @route   PATCH /api/businesses/:id/profile
// @desc    Update business profile information
router.patch('/:id/profile', async (req, res) => {
  try {
    const existing = await Business.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Business not found' });

    const updateData = { 
      ...req.body
    };

    // If business was already verified, maintain its verified status
    if (existing.isVerified) {
      updateData.isVerified = true;
      updateData.verificationStatus = 'Approved';
    }

    const business = await Business.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (req.io) {
      req.io.emit('businessUpdated', { business });
      req.io.emit('queueUpdated', { business });
      req.io.to(`business_${business._id}`).emit('queueUpdated', { business });
      req.io.to('admin').emit('queueUpdated', { business });
    }
    
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/businesses/:id/staff
// @desc    Add a new staff member
router.post('/:id/staff', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    business.staff.push(req.body);
    await business.save();
    
    if (req.io) {
      req.io.to(`business_${business.id}`).emit('queueUpdated', { business });
    }
    
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id/staff/:staffId
// @desc    Remove a staff member
router.delete('/:id/staff/:staffId', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    business.staff = business.staff.filter(s => s._id.toString() !== req.params.staffId);
    await business.save();
    
    if (req.io) {
      req.io.to(`business_${business.id}`).emit('queueUpdated', { business });
    }
    
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id/queue/history/:queueId
// @desc    Delete a queue history record
router.delete('/:id/queue/history/:queueId', async (req, res) => {
  try {
    const queueRecord = await Queue.findById(req.params.queueId);
    if (!queueRecord) return res.status(404).json({ message: 'Queue record not found' });
    
    // Ensure it belongs to the business
    if (queueRecord.businessId.toString() !== req.params.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Queue.findByIdAndDelete(req.params.queueId);
    
    if (req.io) {
      req.io.to(`business_${req.params.id}`).emit('queueUpdated', { deletedQueueId: req.params.queueId });
    }
    
    res.json({ message: 'Queue record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id/queue/history
// @desc    Clear ALL queue history for a business
router.delete('/:id/queue/history', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    // Delete all queue records for this business
    await Queue.deleteMany({ businessId: req.params.id });
    
    if (req.io) {
      req.io.to(`business_${req.params.id}`).emit('queueUpdated', { clearAll: true });
    }
    
    res.json({ message: 'All queue history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/businesses/:id/announcements/staff
// @desc    Broadcast announcement to staff
router.post('/:id/announcements/staff', async (req, res) => {
  const { message } = req.body;
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    if (!business.staffAnnouncements) {
      business.staffAnnouncements = [];
    }

    const newAnnouncement = { message, date: new Date() };
    business.staffAnnouncements.unshift(newAnnouncement);
    // Keep only last 50 announcements to avoid huge documents
    if (business.staffAnnouncements.length > 50) {
      business.staffAnnouncements = business.staffAnnouncements.slice(0, 50);
    }
    
    await business.save();

    const savedAnnouncement = business.staffAnnouncements[0];

    if (req.io) {
      req.io.to(`business_${req.params.id}`).emit('notification', {
        id: savedAnnouncement._id,
        type: 'staff_announcement',
        message: savedAnnouncement.message,
        timestamp: savedAnnouncement.date
      });
    }
    res.json({ success: true, announcement: savedAnnouncement });
  } catch (error) {
    console.error('Error creating staff announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/businesses/:id/announcements/staff
// @desc    Get all staff announcements
router.get('/:id/announcements/staff', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    if (!business.staffAnnouncements) {
      business.staffAnnouncements = [];
    }

    // Map to generic notification format for the frontend
    const notifications = business.staffAnnouncements.map(a => ({
      id: a._id,
      type: 'staff_announcement',
      message: a.message,
      timestamp: a.date,
      read: false
    }));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching staff announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id/announcements/staff/:announcementId
// @desc    Delete a staff announcement
router.delete('/:id/announcements/staff/:announcementId', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    if (!business.staffAnnouncements) {
      business.staffAnnouncements = [];
    }

    business.staffAnnouncements = business.staffAnnouncements.filter(
      a => a._id.toString() !== req.params.announcementId
    );
    await business.save();

    // Optionally emit an event to tell staff to remove the notification, 
    // but a simple UI reload will also work. Let's emit a deletion event.
    if (req.io) {
      req.io.to(`business_${req.params.id}`).emit('notification_deleted', {
        id: req.params.announcementId
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id/appointments/:aptId
// @desc    Delete an appointment (clean up history)
router.delete('/:id/appointments/:aptId', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.aptId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Ensure the appointment belongs to this business
    if (appointment.businessId.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Appointment.findByIdAndDelete(req.params.aptId);
    
    if (req.io) {
      req.io.to(`user_${appointment.customerId._id}`).emit('appointmentUpdated');
    }
    
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Verification Routes ---

// @route   GET /api/businesses/:id/queue/verification-requests
// @desc    Fetch all pending verification requests
router.get('/:id/queue/verification-requests', async (req, res) => {
  try {
    const queue = await Queue.find({ 
      businessId: req.params.id, 
      status: { $in: ['pending_verification', 'info_requested'] }
    }).populate('customerId', 'name email').sort({ verificationSubmittedAt: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/queue/:queueId/verify/approve
// @desc    Approve verification and generate token
router.patch('/:id/queue/:queueId/verify/approve', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });
    
    const business = await Business.findById(req.params.id);
    
    // Generate Token
    const isTokenEmpty = !business.currentToken || business.currentToken === '-';
    const prefix = isTokenEmpty ? 'A' : business.currentToken.split('-')[0];
    const currentNum = isTokenEmpty ? 0 : parseInt(business.currentToken.split('-')[1]);
    const myNum = currentNum + business.waiting + 1;
    const myToken = `${prefix}-${String(myNum).padStart(3, '0')}`;
    
    business.waiting += 1;
    business.queueActive = true;
    if (isTokenEmpty) {
      business.currentToken = `${prefix}-000`;
    }
    await business.save();

    queue.status = 'waiting';
    queue.token = myToken;
    queue.position = business.waiting;
    queue.verificationChecklist = req.body?.verificationChecklist || queue.verificationChecklist;
    await queue.save();

    if (req.io) {
      notify(req.io, {
        receiverId: req.params.id,
        receiverRole: 'business',
        title: 'Verification Approved',
        message: `✅ Verification approved: Token ${queue.token} assigned to ${queue.customerId?.name || 'customer'}.`,
        type: 'queue_approved'
      });

      notify(req.io, {
        receiverId: queue.customerId,
        receiverRole: 'customer',
        title: 'Verification Approved',
        message: `✅ Your verification was approved. Your token is ${queue.token}.`,
        type: 'queue_approved'
      });

      req.io.to(`business_${req.params.id}`).emit('queueUpdated', { business, newQueue: queue });
      req.io.to(`customer_${queue.customerId}`).emit('customerQueueUpdated', { queue });
    }
    
    res.json(queue);
  } catch (error) {
    console.error('Error in approve:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/businesses/:id/queue/:queueId/verify/reject
// @desc    Reject verification
router.patch('/:id/queue/:queueId/verify/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });
    
    queue.status = 'rejected';
    queue.rejectionReason = reason;
    await queue.save();

    if (req.io) {
      notify(req.io, {
        receiverId: req.params.id,
        receiverRole: 'business',
        title: 'Verification Rejected',
        message: `❌ Verification rejected for ${queue.customerId?.name || 'a customer'}: ${reason || 'No reason provided'}.`,
        type: 'queue_rejected'
      });

      notify(req.io, {
        receiverId: queue.customerId,
        receiverRole: 'customer',
        title: 'Verification Rejected',
        message: `❌ Your verification was rejected: ${reason || 'No reason provided'}.`,
        type: 'queue_rejected'
      });

      req.io.to(`business_${req.params.id}`).emit('queueUpdated', { newQueue: queue });
      req.io.to(`customer_${queue.customerId}`).emit('customerQueueUpdated', { queue });
    }
    
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to calculate 10 minutes prior arrival time
const calculateArriveBefore = (timeStr) => {
  if (!timeStr) return '';
  try {
    let hours = 0;
    let minutes = 0;
    const clean = timeStr.trim();
    if (clean.includes(':')) {
      const parts = clean.split(' ');
      const timeParts = parts[0].split(':');
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
      if (parts[1] && parts[1].toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      } else if (parts[1] && parts[1].toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      const d = new Date();
      d.setHours(hours, minutes - 10, 0, 0);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    console.error('Error calculating arrive time:', e);
  }
  return timeStr;
};

// @route   PATCH /api/businesses/:id/queue/:queueId/suggest-time
// @desc    Suggest new time slot for a live queue customer
router.patch('/:id/queue/:queueId/suggest-time', async (req, res) => {
  try {
    const { suggestedTime, suggestedDate, note } = req.body;
    const queue = await Queue.findById(req.params.queueId).populate('customerId', 'name phone email');
    if (!queue) return res.status(404).json({ message: 'Queue item not found' });

    let business = await Business.findById(req.params.id);
    if (!business) {
      business = await Business.findOne({ userId: req.params.id });
    }
    if (!business) {
      business = await Business.findById(queue.businessId);
    }
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const arriveBy = calculateArriveBefore(suggestedTime);

    queue.status = 'suggested_time';
    queue.suggestedTime = suggestedTime;
    queue.suggestedDate = suggestedDate ? new Date(suggestedDate) : new Date();
    queue.suggestedNote = note || '';
    queue.suggestedArriveBy = arriveBy;
    queue.suggestionAccepted = false;
    await queue.save();

    if (req.io) {
      if (queue.customerId) {
        const custId = queue.customerId._id || queue.customerId;
        notify(req.io, {
          receiverId: custId,
          receiverRole: 'customer',
          title: 'New Time Suggested',
          message: `💡 Business suggested a new time slot: ${suggestedTime}. (Arrive by: ${arriveBy})`,
          type: 'queue_suggested'
        });
        req.io.to(`customer_${custId}`).emit('customerQueueUpdated', { queue });
      }

      notify(req.io, {
        receiverId: business._id,
        receiverRole: 'business',
        title: 'Time Suggested to Customer',
        message: `Suggested slot ${suggestedTime} sent to ${queue.customerId?.name || 'Customer'}. (Must arrive by: ${arriveBy})`,
        type: 'queue_suggested'
      });

      req.io.emit('queueUpdated', { business, newQueue: queue });
      req.io.to(`business_${business._id}`).emit('queueUpdated', { business, newQueue: queue });
    }

    res.json(queue);
  } catch (error) {
    console.error('Error suggesting queue time:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/businesses/:id/queue/:queueId/verify/request-info
// @desc    Request more info from customer
router.patch('/:id/queue/:queueId/verify/request-info', async (req, res) => {
  try {
    const { reason } = req.body;
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });
    
    queue.status = 'info_requested';
    queue.moreInfoReason = reason;
    await queue.save();

    if (req.io) {
      req.io.to(`business_${req.params.id}`).emit('queueUpdated', { newQueue: queue });
      req.io.to(`customer_${queue.customerId}`).emit('customerQueueUpdated', { queue });
    }
    
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id
// @desc    Admin delete a business and its associated records
router.delete('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    await Queue.deleteMany({ businessId: business._id });
    await Business.findByIdAndDelete(business._id);

    if (req.io) {
      req.io.emit('businessDeleted', { businessId: business._id });
      req.io.emit('businessUpdated', { deletedId: business._id });
    }

    res.json({ success: true, message: `Business '${business.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
