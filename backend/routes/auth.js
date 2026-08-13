const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   GET /api/auth/users
// @desc    Get all users (for admin dashboard)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Check if it's an owner email from a registered business
      const business = await Business.findOne({ ownerEmail: email });
      if (business) {
        user = await User.findOne({ businessId: business._id });
      }
    }

    if (user && (await user.matchPassword(password))) {
      
      if (user.role === 'Business' && user.businessId) {
        const business = await Business.findById(user.businessId);
        if (business && !business.isVerified) {
          return res.status(403).json({ message: 'Your business account is pending admin approval.' });
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        preferences: user.preferences,
        role: user.role,
        businessId: user.businessId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register/customer
// @desc    Register a new customer
router.post('/register/customer', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Customer',
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        theme: 'light'
      }
    });

    if (user) {
      // Notify Admin
      const Announcement = require('../models/Announcement');
      await Announcement.create({
        title: 'New Customer Joined',
        message: `${name} (${email}) has joined the platform.`,
        targetAudience: 'Admin',
        priority: 'Normal'
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        preferences: user.preferences,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Customer Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register/business
// @desc    Register a new business and admin user
router.post('/register/business', async (req, res) => {
  const { 
    name, email, businessPhone, phone, password, category,
    country, state, district, city, address, pinCode,
    ownerName, ownerEmail, ownerMobile, designation,
    docLogo, docPhoto, docGovId, docRegCert, docGst,
    openingTime, closingTime, workingDays, serviceCounters, avgServiceTime
  } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create Business Profile with all details
    const business = await Business.create({
      name,
      email,
      phone: businessPhone || phone,
      category,
      country, state, district, city, address: address || 'Address pending verification', pinCode,
      ownerName, ownerEmail, ownerMobile, designation,
      docLogo, docPhoto, docGovId, docRegCert, docGst,
      openingTime, closingTime, workingDays, serviceCounters, avgServiceTime,
      isVerified: false,
      verificationStatus: 'Pending Review',
      queueActive: false,
      currentToken: '-',
      waiting: 0
    });

    // Create User linked to Business
    const user = await User.create({
      name: `${name} Admin`,
      email,
      password,
      role: 'Business',
      businessId: business._id,
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        theme: 'light'
      }
    });

    if (user && business) {
      // Notify Admin
      const Announcement = require('../models/Announcement');
      await Announcement.create({
        title: 'New Business Registration',
        message: `${name} has applied for verification. Please review their submitted documents.`,
        targetAudience: 'Admin',
        priority: 'High'
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        preferences: user.preferences,
        role: user.role,
        businessId: business._id,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user or business data' });
    }
  } catch (error) {
    console.error('Business Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', async (req, res) => {
  const { id, name, email, phone, address, city, oldPassword, newPassword, preferences } = req.body;

  try {
    const user = await User.findById(id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone !== undefined ? phone : user.phone;
      user.address = address !== undefined ? address : user.address;
      user.city = city !== undefined ? city : user.city;
      
      if (newPassword) {
        if (oldPassword && await user.matchPassword(oldPassword)) {
          user.password = newPassword;
        } else {
          return res.status(400).json({ message: 'Incorrect old password' });
        }
      }
      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        preferences: updatedUser.preferences,
        role: updatedUser.role,
        businessId: updatedUser.businessId,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/auth/profile/:id
// @desc    Delete user account
router.delete('/profile/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.json({ message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Account Deletion Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
