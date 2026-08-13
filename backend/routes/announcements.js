const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// @route   POST /api/announcements
// @desc    Create a new announcement
router.post('/', async (req, res) => {
  const { title, message, targetAudience, priority } = req.body;

  try {
    const announcement = await Announcement.create({
      title,
      message,
      targetAudience,
      priority
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Create Announcement Error:', error);
    res.status(500).json({ message: 'Server error creating announcement' });
  }
});

// @route   GET /api/announcements
// @desc    Get announcements based on role
router.get('/', async (req, res) => {
  const { role } = req.query; // 'Customer', 'Business', or 'Super Admin'

  try {
    let query = {};
    
    if (role === 'Customer') {
      query = { targetAudience: { $in: ['All', 'Customers'] } };
    } else if (role === 'Business') {
      query = { targetAudience: { $in: ['All', 'Businesses'] } };
    } else if (role === 'Super Admin') {
      query = { targetAudience: { $in: ['All', 'Admin'] } };
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error('Fetch Announcements Error:', error);
    res.status(500).json({ message: 'Server error fetching announcements' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    console.error('Delete Announcement Error:', error);
    res.status(500).json({ message: 'Server error deleting announcement' });
  }
});

module.exports = router;
