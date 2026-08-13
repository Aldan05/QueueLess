const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// @route   POST /api/complaints
// @desc    Create a new complaint
router.post('/', async (req, res) => {
  const { reporterId, reporterModel, reporterType, reporterName, subject, description, priority } = req.body;
  try {
    // Generate a new ticket ID
    const latestComplaint = await Complaint.findOne().sort({ createdAt: -1 });
    let nextNum = 1000;
    if (latestComplaint && latestComplaint.ticketId) {
      const numMatch = latestComplaint.ticketId.match(/\d+$/);
      if (numMatch) {
        nextNum = parseInt(numMatch[0]) + 1;
      }
    }
    const ticketId = `TKT-${nextNum}`;

    const newComplaint = new Complaint({
      ticketId,
      reporterId,
      reporterModel: reporterModel || 'User',
      reporterType,
      reporterName,
      subject,
      description,
      priority: priority || 'Medium',
      status: 'Open'
    });

    const savedComplaint = await newComplaint.save();

    // Emit event to admin room
    if (req.io) {
      req.io.to('admin').emit('newComplaint', savedComplaint);
    }

    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Server error creating complaint' });
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints (Admin)
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching complaints' });
  }
});

// @route   GET /api/complaints/my/:id
// @desc    Get complaints for a specific reporter
router.get('/my/:id', async (req, res) => {
  try {
    const complaints = await Complaint.find({ reporterId: req.params.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your complaints' });
  }
});

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status (Admin)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.status = status;
    const updatedComplaint = await complaint.save();

    // Emit event to admins
    if (req.io) {
      req.io.to('admin').emit('complaintStatusUpdated', updatedComplaint);
      // If we had user-specific rooms, we could emit to the user too
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating complaint' });
  }
});

module.exports = router;
