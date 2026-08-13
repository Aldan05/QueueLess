const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Review = require('../models/Review');
const { notify } = require('./notification');

// @route   POST /api/customer/queue/join
// @desc    Customer joins a business queue
router.post('/queue/join', async (req, res) => {
  const { businessId, userId, partySize, purpose, notes, customerPhone, idNumber, documents } = req.body;
  
  try {
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    // Fetch customer details to use name in notifications
    const customer = await User.findById(userId);
    const customerName = customer ? customer.name : 'A customer';
    
    // Check if customer already in queue (waiting or pending verification)
    const existingQueue = await Queue.findOne({ 
      businessId, 
      customerId: userId, 
      status: { $in: ['waiting', 'pending_verification', 'info_requested'] } 
    });
    
    if (existingQueue) {
      return res.json({
        businessId: existingQueue.businessId,
        queueId: existingQueue._id,
        token: existingQueue.token,
        status: existingQueue.status,
        position: existingQueue.position,
        joinTime: existingQueue.joinTime,
        message: 'Reconnected to existing queue'
      });
    }

    const requireVerification = business.verificationSettings?.requireVerification || (documents && documents.length > 0);

    if (requireVerification) {
      // Verification flow
      const newQueue = new Queue({
        businessId,
        customerId: userId,
        token: 'PENDING',
        position: 0,
        partySize: partySize || 1,
        purpose: purpose || 'General',
        notes: notes || '',
        status: 'pending_verification',
        customerPhone,
        idNumber,
        documents,
        verificationSubmittedAt: new Date()
      });
      await newQueue.save();

      if (req.io) {
        console.log(`[DEBUG] Emitting verificationRequested and queueUpdated to business_${businessId} for pending verification by ${customerName}`);
        req.io.to(`business_${businessId}`).emit('verificationRequested', { newQueue });
        req.io.to(`business_${businessId}`).emit('queueUpdated', { business, newQueue });
        req.io.emit('queueUpdated', { business, newQueue });
        req.io.to(`business_${businessId}`).emit('notification', {
          type: 'verification_requested',
          message: `📄 Verification requested: ${customerName} submitted documents for verification.`
        });
      }

      return res.json({
        businessId: newQueue.businessId,
        queueId: newQueue._id,
        token: newQueue.token,
        status: newQueue.status,
        position: newQueue.position,
        joinTime: newQueue.joinTime
      });
    } else {
      // Standard flow
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
      
      const newQueue = new Queue({
        businessId,
        customerId: userId,
        token: myToken,
        position: business.waiting,
        partySize: partySize || 1,
        purpose: purpose || 'General',
        notes: notes || ''
      });
      await newQueue.save();

       // Emit live update
      if (req.io) {
        notify(req.io, {
          receiverId: businessId,
          receiverRole: 'business',
          title: 'New Queue Request',
          message: `🎟 New Queue Request: ${customerName} joined queue (Token ${myToken}).`,
          type: 'queue_join'
        });

        req.io.to(`business_${businessId}`).emit('queueUpdated', { business, newQueue });
        req.io.emit('queueUpdated', { business, newQueue });
      }
      
      return res.json({
        businessId,
        queueId: newQueue._id,
        token: myToken,
        status: 'waiting',
        position: business.waiting,
        joinTime: newQueue.joinTime
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/customer/queue/leave
// @desc    Customer leaves a queue
router.post('/queue/leave', async (req, res) => {
  const { businessId, userId, queueId } = req.body;
  
  try {
    let query = {};
    if (queueId) {
      query = { _id: queueId };
    } else {
      query = { 
        customerId: userId, 
        status: { $in: ['waiting', 'pending_verification', 'info_requested', 'suggested_time', 'serving', 'rejected'] } 
      };
      if (businessId) query.businessId = businessId;
    }

    const queue = await Queue.findOne(query);
    if (queue) {
      queue.status = 'cancelled';
      await queue.save();

      let business = await Business.findById(queue.businessId);
      if (!business) {
        business = await Business.findOne({ userId: queue.businessId });
      }

      if (business && queue.token && queue.token !== 'PENDING') {
        business.waiting = Math.max(0, business.waiting - 1);
        await business.save();
      }

      // Emit live update
      if (req.io) {
        const bId = business ? business._id : queue.businessId;
        notify(req.io, {
          receiverId: bId,
          receiverRole: 'business',
          title: 'Queue Booking Cancelled',
          message: `❌ Queue booking cancelled for Token ${queue.token || 'Request'}.`,
          type: 'queue_cancelled'
        });

        req.io.emit('queueUpdated', { business, newQueue: queue });
        if (business) {
          req.io.to(`business_${business._id}`).emit('queueUpdated', { business, newQueue: queue });
        }
        req.io.to(`customer_${queue.customerId}`).emit('customerQueueUpdated', { queue });
      }
      return res.json({ message: 'Left queue successfully' });
    }
    res.status(404).json({ message: 'Active queue not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/customer/queue/active/:userId
// @desc    Get active queue for a customer
router.get('/queue/active/:userId', async (req, res) => {
  try {
    const queue = await Queue.findOne({ 
      customerId: req.params.userId, 
      status: { $in: ['waiting', 'pending_verification', 'info_requested', 'suggested_time', 'serving', 'rejected'] } 
    }).sort({ createdAt: -1 });

    if (queue) {
      return res.json({
        businessId: queue.businessId,
        queueId: queue._id,
        token: queue.token,
        status: queue.status,
        position: queue.position,
        joinTime: queue.joinTime,
        suggestedTime: queue.suggestedTime,
        suggestedDate: queue.suggestedDate,
        suggestedNote: queue.suggestedNote,
        suggestedArriveBy: queue.suggestedArriveBy,
        suggestionAccepted: queue.suggestionAccepted,
        moreInfoReason: queue.moreInfoReason,
        rejectionReason: queue.rejectionReason,
        documents: queue.documents
      });
    }
    res.status(404).json({ message: 'No active queue' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/customer/queue/:queueId/accept-suggestion
// @desc    Customer accepts suggested time to enter the live queue
router.patch('/queue/:queueId/accept-suggestion', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    let business = await Business.findById(queue.businessId);
    if (!business) {
      business = await Business.findOne({ userId: queue.businessId });
    }
    if (!business) return res.status(404).json({ message: 'Business not found' });

    // Generate valid token if currently PENDING
    if (!queue.token || queue.token === 'PENDING') {
      const isTokenEmpty = !business.currentToken || business.currentToken === '-';
      const prefix = isTokenEmpty ? 'A' : business.currentToken.split('-')[0];
      const currentNum = isTokenEmpty ? 0 : parseInt(business.currentToken.split('-')[1]);
      const myNum = currentNum + business.waiting + 1;
      const myToken = `${prefix}-${String(myNum).padStart(3, '0')}`;
      
      queue.token = myToken;
      business.waiting += 1;
      business.queueActive = true;
      if (isTokenEmpty) {
        business.currentToken = `${prefix}-000`;
      }
      await business.save();
    }

    queue.status = 'waiting';
    queue.suggestionAccepted = true;
    queue.position = business.waiting;
    await queue.save();

    if (req.io) {
      req.io.emit('queueUpdated', { business, newQueue: queue });
      req.io.to(`business_${business._id}`).emit('queueUpdated', { business, newQueue: queue });
      req.io.to(`customer_${queue.customerId}`).emit('customerQueueUpdated', { queue });
      req.io.to(`business_${business._id}`).emit('notification', {
        type: 'suggestion_accepted',
        message: `Customer accepted suggested slot for ${queue.suggestedTime || 'queue'}. (Token: ${queue.token})`
      });
    }

    res.json({
      success: true,
      queue,
      message: `Suggestion accepted! Please arrive 10 minutes before (${queue.suggestedArriveBy || '10 min before'}) to join.`
    });
  } catch (error) {
    console.error('Error accepting queue suggestion:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/customer/queue/:queueId/decline-suggestion
// @desc    Customer declines suggested time and leaves/cancels queue
router.patch('/queue/:queueId/decline-suggestion', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    let business = await Business.findById(queue.businessId);
    if (!business) {
      business = await Business.findOne({ userId: queue.businessId });
    }

    queue.status = 'cancelled';
    await queue.save();

    if (business && queue.token && queue.token !== 'PENDING') {
      business.waiting = Math.max(0, business.waiting - 1);
      await business.save();
    }

    if (req.io && business) {
      req.io.emit('queueUpdated', { business, newQueue: queue });
      req.io.to(`business_${business._id}`).emit('queueUpdated', { business, newQueue: queue });
      req.io.to(`customer_${queue.customerId}`).emit('customerQueueUpdated', { queue });
      req.io.to(`business_${business._id}`).emit('notification', {
        type: 'suggestion_declined',
        message: `Customer declined the suggested queue time.`
      });
    }

    res.json({ success: true, message: 'Suggestion declined' });
  } catch (error) {
    console.error('Error declining queue suggestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/customer/appointments/:userId
// @desc    Get appointments for a customer
router.get('/appointments/:userId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ customerId: req.params.userId }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to normalize any time format to 24-hour HH:MM for consistent comparison
const normalizeTo24Hour = (timeStr) => {
  if (!timeStr) return '';
  const clean = timeStr.trim().toUpperCase();
  if (clean.includes('AM') || clean.includes('PM')) {
    const isPM = clean.includes('PM');
    const timePart = clean.replace(/AM|PM/g, '').trim();
    const parts = timePart.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] || '0', 10);
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  } else if (clean.includes(':')) {
    const parts = clean.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] || '0', 10);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  return clean;
};

// @route   GET /api/customer/appointments/booked/:businessId
// @desc    Get booked/appointed time slots for a business on a specific date
router.get('/appointments/booked/:businessId', async (req, res) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfDayUTC = new Date(Date.UTC(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999));

    const minDate = new Date(Math.min(startOfDay.getTime(), startOfDayUTC.getTime()));
    const maxDate = new Date(Math.max(endOfDay.getTime(), endOfDayUTC.getTime()));

    const appointments = await Appointment.find({ 
      businessId: req.params.businessId,
      date: { $gte: minDate, $lte: maxDate },
      status: { $in: ['pending', 'approved', 'checked_in', 'in_service', 'suggested'] } 
    }).select('time suggestedTime status');

    const bookedTimes = [];
    appointments.forEach(apt => {
      if (apt.time) {
        bookedTimes.push(apt.time.trim());
        const norm = normalizeTo24Hour(apt.time);
        if (norm && !bookedTimes.includes(norm)) bookedTimes.push(norm);
      }
      if (apt.suggestedTime) {
        bookedTimes.push(apt.suggestedTime.trim());
        const norm = normalizeTo24Hour(apt.suggestedTime);
        if (norm && !bookedTimes.includes(norm)) bookedTimes.push(norm);
      }
    });

    res.json([...new Set(bookedTimes)]);
  } catch (error) {
    console.error('Error fetching booked times:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/customer/appointments
// @desc    Customer books an appointment
router.post('/appointments', async (req, res) => {
  const { businessId, customerId, date, time, notes, service, documents } = req.body;
  try {
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfDayUTC = new Date(Date.UTC(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999));

    const minDate = new Date(Math.min(startOfDay.getTime(), startOfDayUTC.getTime()));
    const maxDate = new Date(Math.max(endOfDay.getTime(), endOfDayUTC.getTime()));

    // Check if time is already appointed/booked with normalized comparison
    const existingAppointments = await Appointment.find({
      businessId,
      date: { $gte: minDate, $lte: maxDate },
      status: { $in: ['pending', 'approved', 'checked_in', 'in_service', 'suggested'] }
    });

    const targetNorm = normalizeTo24Hour(time);
    const existingAppointment = existingAppointments.find(apt => {
      const aptNorm = normalizeTo24Hour(apt.time);
      const suggNorm = apt.suggestedTime ? normalizeTo24Hour(apt.suggestedTime) : null;
      return aptNorm === targetNorm || (suggNorm && suggNorm === targetNorm);
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        message: `This time slot (${time}) is already appointed by another customer. Please choose an available time slot.` 
      });
    }

    const newAppointment = new Appointment({
      businessId,
      customerId,
      date: queryDate,
      time: time ? time.trim() : '',
      notes,
      service,
      status: 'pending',
      documents
    });
    await newAppointment.save();

    // Fetch customer details for notification
    const customer = await User.findById(customerId);
    const customerName = customer ? customer.name : 'Customer';

    // Emit real-time updates to Business, Staff, and other Customers
    if (req.io) {
      // 1. Broadcast booked slot to all customers to lock the slot in real-time
      console.log(`[DEBUG] Emitting appointmentBooked to all: businessId=${businessId}, date=${date}, time=${time}`);
      req.io.emit('appointmentBooked', { 
        businessId: businessId, 
        date: date, 
        time: time 
      });

      const notifMsg = `📅 New Appointment Request: ${customerName} booked for ${new Date(date).toLocaleDateString()} at ${time} (${service || 'General Service'}).`;
      notify(req.io, {
        receiverId: businessId,
        receiverRole: 'business',
        title: 'New Appointment Request',
        message: notifMsg,
        type: 'appointment_new'
      });

      req.io.to(`business_${businessId}`).emit('appointmentUpdated', { appointment: newAppointment });
      req.io.to(`customer_${customerId}`).emit('appointmentUpdated', { appointment: newAppointment });
    }

    res.json(newAppointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/customer/appointments/:aptId/accept-suggestion
// @desc    Customer accepts suggested time
router.patch('/appointments/:aptId/accept-suggestion', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.aptId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    if (appointment.status !== 'suggested' && !appointment.suggestedTime) {
      return res.status(400).json({ message: 'No suggestion to accept' });
    }

    const crypto = require('crypto');
    const getServicePrefix = (serviceName) => {
      if (!serviceName) return 'TK';
      return serviceName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    };

    if (appointment.suggestedTime) {
      appointment.time = appointment.suggestedTime;
    }
    appointment.suggestedTime = '';
    
    // Status becomes approved since customer agreed to the business's proposed slot
    appointment.status = 'approved';

    // Generate Booking ID: QL-YYYYMMDD-XXXXX if not present
    if (!appointment.bookingId) {
      const dateStr = new Date(appointment.date).toISOString().slice(0,10).replace(/-/g, '');
      const randomBookingStr = Math.floor(10000 + Math.random() * 90000);
      appointment.bookingId = `QL-${dateStr}-${randomBookingStr}`;
    }
    
    // Generate Token Number: e.g. GC-015 if not present
    if (!appointment.tokenNumber) {
      const prefix = getServicePrefix(appointment.service);
      const randomTokenNum = Math.floor(100 + Math.random() * 900);
      appointment.tokenNumber = `${prefix}-${randomTokenNum}`;
    }
    
    // Generate Verification Code if not present
    if (!appointment.verificationCode) {
      appointment.verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    await appointment.save();

    // Fetch customer details to use name in notifications
    const customer = await User.findById(appointment.customerId);
    const customerName = customer ? customer.name : 'Customer';
    
    if (req.io) {
      notify(req.io, {
        receiverId: appointment.businessId,
        receiverRole: 'business',
        title: 'Suggestion Accepted',
        message: `✅ ${customerName} accepted the suggested time of ${appointment.time} on ${new Date(appointment.date).toLocaleDateString()}.`,
        type: 'appointment_approved'
      });

      notify(req.io, {
        receiverId: appointment.customerId,
        receiverRole: 'customer',
        title: 'Appointment Confirmed',
        message: `✅ Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} is now confirmed!`,
        type: 'appointment_approved'
      });

      req.io.emit('appointmentUpdated', { appointment });
      req.io.to(`business_${appointment.businessId}`).emit('appointmentUpdated', { appointment });
      req.io.to(`customer_${appointment.customerId}`).emit('appointmentUpdated', { appointment });
      req.io.emit('appointmentBooked', { 
        businessId: appointment.businessId, 
        date: appointment.date, 
        time: appointment.time 
      });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Accept suggestion error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/customer/appointments/:id/cancel
// @desc    Customer cancels an appointment
router.patch('/appointments/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = 'cancelled';
    await appointment.save();

    // Emit live update to business & staff
    if (req.io) {
      notify(req.io, {
        receiverId: appointment.businessId,
        receiverRole: 'business',
        title: 'Appointment Cancelled',
        message: `🚫 An appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was cancelled by the customer.`,
        type: 'appointment_cancelled'
      });

      req.io.to(`business_${appointment.businessId}`).emit('appointmentUpdated', { appointment });
      req.io.to(`customer_${appointment.customerId}`).emit('appointmentUpdated', { appointment });
      req.io.emit('appointmentUpdated', { appointment });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/customer/queue/history/:userId
// @desc    Get queue history for a customer
router.get('/queue/history/:userId', async (req, res) => {
  try {
    const history = await Queue.find({ 
      customerId: req.params.userId,
      status: { $in: ['completed', 'cancelled', 'skipped'] }
    }).sort({ joinTime: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/customer/favorites/:userId
// @desc    Get favorite businesses for a customer
router.get('/favorites/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user.favoriteBusinesses || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/customer/favorites
// @desc    Add a business to favorites
router.post('/favorites', async (req, res) => {
  const { userId, businessId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user.favoriteBusinesses) user.favoriteBusinesses = [];
    if (!user.favoriteBusinesses.includes(businessId)) {
      user.favoriteBusinesses.push(businessId);
      await user.save();

      const business = await Business.findById(businessId);
      if (business) {
        business.favoritesCount = (business.favoritesCount || 0) + 1;
        await business.save();
        if (req.io) {
          req.io.emit('queueUpdated', { business });
        }
      }
    }
    res.json(user.favoriteBusinesses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/customer/favorites/:userId/:businessId
// @desc    Remove a business from favorites
router.delete('/favorites/:userId/:businessId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user.favoriteBusinesses) user.favoriteBusinesses = [];
    
    if (user.favoriteBusinesses.some(id => id.toString() === req.params.businessId)) {
      user.favoriteBusinesses = user.favoriteBusinesses.filter(id => id.toString() !== req.params.businessId);
      await user.save();

      const business = await Business.findById(req.params.businessId);
      if (business) {
        business.favoritesCount = Math.max(0, (business.favoritesCount || 0) - 1);
        await business.save();
        if (req.io) {
          req.io.emit('queueUpdated', { business });
        }
      }
    }
    res.json(user.favoriteBusinesses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to recalculate and update business rating & distribution
const recalculateBusinessRating = async (businessId, io) => {
  const allReviews = await Review.find({ businessId });
  const totalReviews = allReviews.length;
  
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let ratingSum = 0;

  allReviews.forEach(r => {
    const cleanRating = Math.min(5, Math.max(1, Number(r.rating) || 5));
    ratingSum += cleanRating;
    const rounded = Math.min(5, Math.max(1, Math.round(cleanRating)));
    ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
  });

  // Calculate exact average strictly out of 5.0
  const rawAvg = totalReviews > 0 ? (ratingSum / totalReviews) : 0;
  const averageRating = Math.min(5, Math.max(0, parseFloat(rawAvg.toFixed(1))));

  const updatedBusiness = await Business.findByIdAndUpdate(
    businessId,
    {
      rating: averageRating,
      reviewCount: totalReviews,
      ratingDistribution
    },
    { new: true }
  );

  if (updatedBusiness && io) {
    io.emit('businessUpdated', { business: updatedBusiness });
    io.emit('queueUpdated', { business: updatedBusiness });
  }

  return { averageRating, totalReviews, ratingDistribution, business: updatedBusiness };
};

// @route   GET /api/customer/reviews/:businessId
// @desc    Get reviews for a business along with rating breakdown
router.get('/reviews/:businessId', async (req, res) => {
  try {
    const reviews = await Review.find({ businessId: req.params.businessId })
                                .populate('customerId', 'name email role isVerified')
                                .sort({ createdAt: -1 });

    // Calculate rating distribution and average strictly out of 5.0
    const totalReviews = reviews.length;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    reviews.forEach(r => {
      const cleanRating = Math.min(5, Math.max(1, Number(r.rating) || 5));
      ratingSum += cleanRating;
      const rounded = Math.min(5, Math.max(1, Math.round(cleanRating)));
      ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
    });

    const rawAvg = totalReviews > 0 ? (ratingSum / totalReviews) : 0;
    const averageRating = Math.min(5, Math.max(0, parseFloat(rawAvg.toFixed(1))));

    const business = await Business.findById(req.params.businessId);
    if (business && (business.rating !== averageRating || business.reviewCount !== totalReviews || business.rating > 5)) {
      business.rating = averageRating;
      business.reviewCount = totalReviews;
      business.ratingDistribution = ratingDistribution;
      await business.save();
      if (req.io) {
        req.io.emit('businessUpdated', { business });
      }
    }

    res.json({
      reviews,
      summary: {
        averageRating,
        totalReviews,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/customer/reviews
// @desc    Add a review & recalculate business overall rating
router.post('/reviews', async (req, res) => {
  const { businessId, customerId, rating, waitTimeRating, staffBehaviourRating, feedback, queueId, appointmentId } = req.body;
  try {
    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const numWaitRating = waitTimeRating ? Math.min(5, Math.max(1, Number(waitTimeRating))) : numRating;
    const numStaffRating = staffBehaviourRating ? Math.min(5, Math.max(1, Number(staffBehaviourRating))) : numRating;

    const newReview = new Review({
      businessId,
      customerId,
      rating: numRating,
      waitTimeRating: numWaitRating,
      staffBehaviourRating: numStaffRating,
      feedback: feedback || '',
      queueId,
      appointmentId
    });
    await newReview.save();
    await newReview.populate('customerId', 'name email role isVerified');

    if (queueId) {
      await Queue.findByIdAndUpdate(queueId, { rating: numRating });
    }

    // Recalculate Business Overall Rating and Distribution
    const { averageRating, totalReviews, ratingDistribution, business } = await recalculateBusinessRating(businessId, req.io);

    if (req.io) {
      req.io.emit('reviewAdded', { review: newReview, business });
    }

    res.json({
      review: newReview,
      summary: {
        averageRating,
        totalReviews,
        ratingDistribution
      },
      business
    });
  } catch (error) {
    console.error('Review Error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   PATCH /api/customer/reviews/:reviewId/helpful
// @desc    Toggle helpful vote for a review
router.patch('/reviews/:reviewId/helpful', async (req, res) => {
  const { userId } = req.body;
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (!review.helpfulUsers) review.helpfulUsers = [];

    const existingIndex = review.helpfulUsers.findIndex(u => u.toString() === userId);
    let voted = false;

    if (existingIndex > -1) {
      // Remove helpful vote
      review.helpfulUsers.splice(existingIndex, 1);
      voted = false;
    } else {
      // Add helpful vote
      review.helpfulUsers.push(userId);
      voted = true;
    }

    review.helpfulCount = review.helpfulUsers.length;
    await review.save();
    await review.populate('customerId', 'name email role isVerified');

    if (req.io) {
      req.io.emit('reviewUpdated', { review });
    }

    res.json({ review, voted, helpfulCount: review.helpfulCount });
  } catch (error) {
    console.error('Helpful vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/customer/queue/history/:queueId
// @desc    Delete a queue history record from customer view
router.delete('/queue/history/:queueId', async (req, res) => {
  try {
    const queueRecord = await Queue.findById(req.params.queueId);
    if (!queueRecord) return res.status(404).json({ message: 'Queue record not found' });
    
    await Queue.findByIdAndDelete(req.params.queueId);
    
    // Optionally emit event if needed
    if (req.io) {
      req.io.emit('queueUpdated', { deletedQueueId: req.params.queueId });
    }
    
    res.json({ message: 'Queue record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/customer/queue/history/all/:userId
// @desc    Delete ALL queue history records for a customer
router.delete('/queue/history/all/:userId', async (req, res) => {
  try {
    const result = await Queue.deleteMany({
      customerId: req.params.userId,
      status: { $in: ['completed', 'cancelled', 'missed', 'rejected'] }
    });
    
    if (req.io) {
      req.io.emit('queueUpdated', { clearedUserId: req.params.userId });
    }
    
    res.json({ message: `Deleted ${result.deletedCount} history records` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/customer/appointments/:id
// @desc    Delete an appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    await Appointment.findByIdAndDelete(req.params.id);
    
    if (req.io) {
      req.io.to(`business_${appointment.businessId}`).emit('appointmentUpdated');
    }
    
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   PATCH /api/customer/queue/:queueId/documents
// @desc    Customer resubmits documents after being requested for more info
router.patch('/queue/:queueId/documents', async (req, res) => {
  try {
    const { documents } = req.body;
    const queue = await Queue.findById(req.params.queueId);
    
    if (!queue) return res.status(404).json({ message: 'Queue not found' });
    if (queue.status !== 'info_requested' && queue.status !== 'rejected') {
      return res.status(400).json({ message: 'Documents cannot be resubmitted at this stage' });
    }

    queue.documents = documents;
    queue.status = 'pending_verification';
    queue.verificationSubmittedAt = new Date();
    await queue.save();

    if (req.io) {
      req.io.to(`business_${queue.businessId}`).emit('verificationRequested', { newQueue: queue });
      // Tell customer's own socket they updated
      req.io.to(`customer_${queue.customerId}`).emit('customerQueueUpdated', { queue });
    }

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
