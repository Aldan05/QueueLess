const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const StaffLoginHistory = require('../models/StaffLoginHistory');
const Counter = require('../models/Counter');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/staff/login
// @desc    Authenticate staff & get token
router.post('/login', async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const staff = await Staff.findOne({
      $or: [
        { employeeId: employeeId },
        { username: employeeId }
      ]
    }).populate('counterId');

    if (staff && staff.password === password) {
      if (staff.status !== 'Active') {
        return res.status(403).json({ message: 'Your staff account is inactive' });
      }
      
      // Record login history
      await StaffLoginHistory.create({
        staffId: staff._id,
        ipAddress: req.ip,
        device: req.headers['user-agent']
      });

      res.json({
        _id: staff._id,
        businessId: staff.businessId,
        employeeId: staff.employeeId,
        fullName: staff.fullName,
        counter: staff.counterId,
        permissions: staff.permissions,
        role: 'Staff',
        token: generateToken(staff._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid employee ID or password' });
    }
  } catch (error) {
    console.error('Staff Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/staff/business/:businessId
// @desc    Get all staff for a business
router.get('/business/:businessId', async (req, res) => {
  try {
    const staffList = await Staff.find({ businessId: req.params.businessId })
      .populate('counterId', 'name status');
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching staff' });
  }
});

// @route   POST /api/staff/business/:businessId
// @desc    Create a new staff member
router.post('/business/:businessId', async (req, res) => {
  try {
    const { 
      fullName, email, phone, designation, counterId, 
      username, password, permissions 
    } = req.body;
    
    // Check if username exists
    const exists = await Staff.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Username already taken' });

    // Generate simple employee ID e.g. EMP-101
    const count = await Staff.countDocuments({ businessId: req.params.businessId });
    const employeeId = `EMP${(count + 1).toString().padStart(3, '0')}`;

    const staff = new Staff({
      businessId: req.params.businessId,
      employeeId,
      fullName,
      email,
      phone,
      designation,
      counterId: counterId || null,
      username,
      password,
      permissions
    });

    await staff.save();
    
    // Update counter
    if (counterId) {
      await Counter.findByIdAndUpdate(counterId, { currentStaffId: staff._id });
    }

    if (req.io) {
      req.io.to(`business_${req.params.businessId}`).emit('staffUpdated', staff);
    }
    
    res.status(201).json(staff);
  } catch (error) {
    console.error('Create Staff Error:', error);
    res.status(500).json({ message: 'Server error creating staff' });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    if (updates.password) {
      if (!updates.oldPassword) {
        return res.status(400).json({ message: 'Old password is required to set a new password' });
      }
      const currentStaff = await Staff.findById(req.params.id);
      if (!currentStaff) return res.status(404).json({ message: 'Staff not found' });
      if (currentStaff.password !== updates.oldPassword) {
        return res.status(400).json({ message: 'Incorrect old password' });
      }
      delete updates.oldPassword;
    }

    const staff = await Staff.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('counterId', 'name status');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    
    if (req.io) {
      req.io.to(`business_${staff.businessId}`).emit('staffUpdated', staff);
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating staff' });
  }
});

// @route   DELETE /api/staff/:id
// @desc    Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    
    // Unassign from counter
    if (staff.counterId) {
      await Counter.findByIdAndUpdate(staff.counterId, { currentStaffId: null });
    }

    if (req.io) {
      req.io.to(`business_${staff.businessId}`).emit('staffDeleted', staff._id);
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting staff' });
  }
});

// @route   POST /api/staff/scan
// @desc    Scan QR and mark customer checked in
router.post('/scan', async (req, res) => {
  try {
    const { appointmentId, verificationCode, businessId } = req.body;
    
    // We import Appointment here if not already imported at top of file
    const Appointment = require('../models/Appointment');
    
    const appointment = await Appointment.findOne({ 
      _id: appointmentId, 
      businessId,
      verificationCode
    }).populate('customerId', 'name phone');
    
    if (!appointment) return res.status(404).json({ message: 'Invalid QR Code or Appointment not found' });
    if (appointment.status !== 'approved') return res.status(400).json({ message: `Cannot check in. Status is ${appointment.status}` });

    appointment.status = 'checked_in';
    appointment.checkInTime = new Date();
    // Assuming arrivalTime was provided by QR scan time
    appointment.arrivalTime = new Date();
    await appointment.save();
    
    if (req.io) {
      req.io.to(`business_${businessId}`).emit('appointmentUpdated', { appointment });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error during scan' });
  }
});

// @route   PATCH /api/staff/assign-counter
// @desc    Assign a checked-in customer to a counter
router.patch('/assign-counter', async (req, res) => {
  try {
    const { appointmentId, counterNumber, businessId } = req.body;
    const Appointment = require('../models/Appointment');
    const Business = require('../models/Business');
    const Queue = require('../models/Queue');
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    if (appointment.status !== 'checked_in') return res.status(400).json({ message: 'Customer must be checked in first' });

    appointment.status = 'in_service';
    appointment.counterNumber = counterNumber;
    appointment.servedAt = new Date();
    await appointment.save();
    
    // Bridge to Unified Queue System
    const business = await Business.findById(businessId);
    if (business) {
      business.currentToken = appointment.tokenNumber;
      await business.save();
      
      const newQueueEntry = new Queue({
        businessId: business._id,
        customerId: appointment.customerId,
        token: appointment.tokenNumber,
        position: 0,
        status: 'serving',
        joinTime: new Date(),
        callTime: new Date(),
        notes: `Pre-booked Appointment (${appointment.service})`,
        isPriority: true // Appointments can be treated as priority to jump the walk-in queue
      });
      await newQueueEntry.save();
      
      if (req.io) {
        req.io.to(`business_${businessId}`).emit('queueUpdated', { business, newQueue: newQueueEntry });
      }
    }

    if (req.io) {
      req.io.to(`business_${businessId}`).emit('appointmentUpdated', { appointment });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error assigning counter' });
  }
});

module.exports = router;
